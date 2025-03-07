import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../services/auth";
import { uploadInterviewVideo } from "../services/videoService";
import "./MockInterview.css";

const MockInterview = () => {
	const navigate = useNavigate();
	const [time, setTime] = useState(120);
	const [isRunning, setIsRunning] = useState(false);
	const [hasStarted, setHasStarted] = useState(false);
	const [isStopped, setIsStopped] = useState(false);
	const videoRef = useRef(null);
	const mediaRecorderRef = useRef(null);
	const [currentQuestion, setCurrentQuestion] = useState("");
	const [questionCount, setQuestionCount] = useState(1);
	const [isSessionComplete, setIsSessionComplete] = useState(false);
	const [recordings, setRecordings] = useState([]);
	const [isRecording, setIsRecording] = useState(false);
	const [recordingError, setRecordingError] = useState(null);
	const chunksRef = useRef([]);
	const isAuthenticated = !!getUser();
	const [feedbackText, setFeedbackText] = useState("");
	const [isProcessing, setIsProcessing] = useState(false);

	// Scroll to top when component mounts
	useEffect(() => {
		window.scrollTo(0, 0);
	}, []);

	/**
	 * Calls the Gumloop API to start a workflow
	 * @param {string} chatIdValue - The value for the chatID input
	 * @param {string} userIdValue - The value for the userID input
	 * @param {string} linkValue - The value for the link input
	 * @returns {Promise<Object>} - Response containing run details
	 */
	async function startFeedbackWorkflow(chatIdValue, userIdValue, linkValue) {
		const options = {
			method: "POST",
			headers: {
				Authorization: "Bearer cad77750358c4f4a86d789b41d7fae74",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				user_id: "mIsmdAwErVeNYhMZzyRcKZIJj5z1", // Your user ID here
				saved_item_id: "tX1RFG9Mz2kgAbkhgGRMNV", // Updated saved item ID
				pipeline_inputs: [
					{ input_name: "userID", value: userIdValue },
					{ input_name: "chatID", value: chatIdValue },
					{ input_name: "link", value: linkValue },
				],
			}),
		};

		try {
			const response = await fetch(
				"https://api.gumloop.com/api/v1/start_pipeline",
				options
			);

			if (!response.ok) {
				const errorData = await response.json().catch(() => null);
				throw new Error(
					`API request failed with status ${response.status}: ${
						errorData ? JSON.stringify(errorData) : "Unknown error"
					}`
				);
			}

			return await response.json();
		} catch (error) {
			console.error("Error starting workflow:", error);
			throw error;
		}
	}

	// -----
	/**
	 * Calls the Gumloop API to start a workflow
	 * @returns {Promise<string>} - Returns the runId
	 */
	async function startRandomQuestionWorkflow() {
		const options = {
			method: "POST",
			headers: {
				Authorization: "Bearer cad77750358c4f4a86d789b41d7fae74",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				user_id: "mIsmdAwErVeNYhMZzyRcKZIJj5z1", // Hardcoded user_id
				saved_item_id: "8ZaoQgieP52jEuDU6f2PPh", // Static saved_item_id
				pipeline_inputs: [], // No pipeline inputs passed
			}),
		};

		try {
			const response = await fetch(
				"https://api.gumloop.com/api/v1/start_pipeline",
				options
			);

			if (!response.ok) {
				const errorData = await response.json().catch(() => null);
				throw new Error(
					`API request failed with status ${response.status}: ${
						errorData ? JSON.stringify(errorData) : "Unknown error"
					}`
				);
			}

			const data = await response.json();
			const runId = data.run_id; // Assuming `run_id` is part of the response

			return runId; // Return just the run_id here
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Retrieves the run details for a specific flow run
	 * @param {string} runId - The ID of the flow run to retrieve
	 * @returns {Promise<Object>} - Response containing run details
	 */
	async function getRandomQuestionRunDetails(runId) {
		const options = {
			method: "GET",
			headers: {
				Authorization: "Bearer cad77750358c4f4a86d789b41d7fae74",
			},
		};

		try {
			// Polling the run details
			const response = await fetch(
				`https://api.gumloop.com/api/v1/get_pl_run?run_id=${runId}&user_id=mIsmdAwErVeNYhMZzyRcKZIJj5z1`,
				options
			);

			if (!response.ok) {
				const errorData = await response.json().catch(() => null);
				throw new Error(
					`API request failed with status ${response.status}: ${
						errorData ? JSON.stringify(errorData) : "Unknown error"
					}`
				);
			}

			const data = await response.json();

			// Check if the flow is completed and if "question" output exists
			if (data.state === "DONE") {
				if (data.outputs && data.outputs["question"]) {
					return data.outputs["question"]; // Return the value for "question"
				} else {
					throw new Error(
						'Output "question" not found in the run details.'
					);
				}
			} else {
				// Handle other states like RUNNING, FAILED, etc.
				return getRandomQuestionRunDetails(runId); // Optionally, handle this case by polling again
			}
		} catch (error) {
			throw error;
		}
	}
	// -----

	useEffect(() => {
		startCamera();
		setCurrentQuestion(
			startRandomQuestionWorkflow()
				.then((runId) => {
					// Immediately after startWorkflow finishes, call getRunDetails
					return getRandomQuestionRunDetails(runId);
				})
				.then((questionOutput) => {
					// Output the final result for "question"
					if (questionOutput) {
						return questionOutput;
					}
				})
				.catch((err) => {
					console.error("Error:", err);
				})
		);

		return () => {
			// Cleanup: stop camera when component unmounts
			if (videoRef.current && videoRef.current.srcObject) {
				videoRef.current.srcObject
					.getTracks()
					.forEach((track) => track.stop());
			}
		};
	}, []);

	useEffect(() => {
		let interval;
		if (isRunning && time > 0) {
			interval = setInterval(() => {
				setTime((prevTime) => prevTime - 1);
			}, 1000);
		}
		return () => clearInterval(interval);
	}, [isRunning, time]);

	const startCamera = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: true,
			});
			if (videoRef.current) {
				videoRef.current.srcObject = stream;
			}
		} catch (err) {
			console.error("Error accessing camera:", err);
		}
	};

	const generateNewQuestion = () => {
		if (questionCount >= 1) {
			setIsSessionComplete(true);
			setIsRunning(false);
			setIsStopped(true);
			navigate('/interview-analysis');
			return;
		}

		setCurrentQuestion(
			startRandomQuestionWorkflow()
				.then((runId) => {
					return getRandomQuestionRunDetails(runId);
				})
				.then((questionOutput) => {
					if (questionOutput) {
						return questionOutput;
					}
				})
				.catch((err) => {
					console.error("Error:", err);
				})
		);
		setQuestionCount((prevCount) => prevCount + 1);
		setTime(120);
		setIsRunning(false);
		setHasStarted(false);
		setIsStopped(false);
		setFeedbackText("");
	};

	const getFeedbackFromVideo = async (videoUrl) => {
		setIsProcessing(true);
		try {
			// const response = await fetch(
			// 	"your-backend-endpoint/process-video",
			// 	{
			// 		method: "POST",
			// 		headers: {
			// 			"Content-Type": "application/json",
			// 		},
			// 		body: JSON.stringify({
			// 			videoUrl,
			// 			questionNumber: questionCount,
			// 		}),
			// 	}
			// );
			// if (!response.ok) {
			// 	throw new Error("Failed to get feedback");
			// }
			// const data = await response.json();
			// setFeedbackText(data.feedback);

			setFeedbackText("Great Job! ✅");
		} catch (error) {
			console.error("Error getting feedback:", error);
			setRecordingError("Failed to get feedback. Please try again.");
		} finally {
			setIsProcessing(false);
		}
	};

	const startRecording = async () => {
		try {
			chunksRef.current = [];
			const stream = videoRef.current.srcObject;
			const mediaRecorder = new MediaRecorder(stream, {
				mimeType: "video/webm;codecs=vp8,opus",
			});

			mediaRecorder.ondataavailable = (event) => {
				if (event.data.size > 0) {
					chunksRef.current.push(event.data);
				}
			};

			mediaRecorder.onstop = async () => {
				const videoBlob = new Blob(chunksRef.current, {
					type: "video/webm",
				});
				try {
					// Upload video and get download URL
					const result = await uploadInterviewVideo(
						videoBlob,
						questionCount
					);

					// Store the recording with the download URL
					const newRecording = {
						url: result.url, // This is the Firebase Storage download URL
						timestamp: result.timestamp,
						questionNumber: questionCount,
						isAuthenticated: result.isAuthenticated,
						filename: result.filename,
					};

					// Add the new recording to the recordings array
					setRecordings((prev) => [...prev, newRecording]);

					// Get feedback for the video
					await getFeedbackFromVideo(result.url);

					// Log success
					console.log("Video uploaded successfully:", result.url);
				} catch (error) {
					console.error("Error saving recording:", error);
					setRecordingError(
						"Failed to save recording. Please try again."
					);
				}
			};

			mediaRecorderRef.current = mediaRecorder;
			mediaRecorder.start();
			setIsRecording(true);
		} catch (error) {
			console.error("Error starting recording:", error);
			setRecordingError(
				"Failed to start recording. Please check camera permissions."
			);
		}
	};

	const stopRecording = () => {
		if (mediaRecorderRef.current && isRecording) {
			mediaRecorderRef.current.stop();
			setIsRecording(false);
		}
	};

	const toggleTimer = () => {
		if (!hasStarted) {
			// First time starting
			setHasStarted(true);
			setIsRunning(true);
			startRecording();
		} else {
			// Stopping the timer
			setIsRunning(false);
			setIsStopped(true);
			stopRecording();
		}
	};

	const formatTime = (seconds) => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
	};

	const isLastQuestion = questionCount === 1;

	const viewAnalysis = () => {
		navigate("/interview-analysis");
	};

	// Clean up URLs when component unmounts
	useEffect(() => {
		return () => {
			// Clean up object URLs
			recordings.forEach((recording) => {
				if (recording.url) {
					URL.revokeObjectURL(recording.url);
				}
			});
		};
	}, [recordings]);

	return (
		<div className="mock-interview-container">
			<h1>Mock Interview Practice</h1>
			{recordingError && (
				<div className="error-message">{recordingError}</div>
			)}
			<div className="interview-main">
				<div className="content-section">
					<div className="video-section">
						<div className="camera-container">
							<video
								ref={videoRef}
								autoPlay
								playsInline
								muted
								className="camera-feed"
							/>
						</div>
						{!isSessionComplete && (
							<div className="question-container">
								<h2>
									{isProcessing
										? "Processing Video..."
										: feedbackText
										? "Response:"
										: "Interview Question:"}
								</h2>
								<p className="question-text">
									{isProcessing
										? "Please wait while we analyze your response..."
										: feedbackText || currentQuestion}
								</p>
							</div>
						)}
					</div>
				</div>

				<div className="controls-section">
					<div className="question-counter">
						Question {questionCount} of 1
					</div>
					{!isSessionComplete ? (
						<>
							<div className="timer-container">
								<div className="timer-display">
									{formatTime(time)}
								</div>
								<div className="timer-controls">
									<button
										className={`timer-button ${
											isRunning ? "stop" : "start"
										}`}
										onClick={toggleTimer}
										disabled={isStopped}
									>
										{isStopped
											? "Stopped"
											: isRunning
											? "Stop"
											: "Start"}
									</button>
								</div>
							</div>
							{hasStarted && isStopped ? (
								<button
									className="next-question-button"
									onClick={viewAnalysis}
								>
									View Analysis
								</button>
							) : (
								<button
									className="next-question-button"
									onClick={generateNewQuestion}
									disabled={!hasStarted}
								>
									Complete Session
								</button>
							)}
						</>
					) : (
						<div className="session-complete">
							<p className="completion-message">
								Practice session complete! 🎉
							</p>
							<button
								className="new-session-button"
								onClick={viewAnalysis}
							>
								View Analysis
							</button>
						</div>
					)}
					<div className="tips-card">
						<h3>Tips for this question:</h3>
						<ul>
							<li>Structure your answer using the STAR method</li>
							<li>Keep your response under 2 minutes</li>
							<li>
								Include specific examples from your experience
							</li>
							<li>Maintain good eye contact with the camera</li>
						</ul>
					</div>
				</div>
			</div>
			{!isSessionComplete && recordings.length > 0 && (
				<div className="recordings-section">
					<h2>Your Recordings</h2>
					<div className="recordings-grid">
						{recordings.map((recording, index) => (
							<div key={index} className="recording-card">
								<h3>Question {recording.questionNumber}</h3>
								<video
									controls
									src={recording.url}
									className="recording-playback"
								/>
								<p className="recording-timestamp">
									Recorded at:{" "}
									{new Date(
										recording.timestamp
									).toLocaleTimeString()}
								</p>
								{!recording.isAuthenticated && (
									<p className="login-prompt">
										Log in to access additional features
										like AI feedback and progress tracking
									</p>
								)}
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

export default MockInterview;