import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

export default function VideoCall() {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const [roomId, setRoomId] = useState("");
  const [joined, setJoined] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const localStreamRef = useRef(null);

  const mediaConstraints = {
    audio: true,
    video: true,
  };

  const startCall = async () => {
    const localStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
    localStreamRef.current = localStream;
    localVideoRef.current.srcObject = localStream;

    peerConnectionRef.current = new RTCPeerConnection();

    localStream.getTracks().forEach((track) => {
      peerConnectionRef.current.addTrack(track, localStream);
    });

    peerConnectionRef.current.ontrack = (event) => {
      remoteVideoRef.current.srcObject = event.streams[0];
    };

    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { roomId, candidate: event.candidate });
      }
    };
  };

  const joinRoom = () => {
    if (roomId.trim() !== "") {
      socket.emit("join", roomId);
      setJoined(true);
      startCall();
    }
  };

  const toggleVideo = () => {
    const videoTrack = localStreamRef.current.getVideoTracks()[0];
    videoTrack.enabled = !videoTrack.enabled;
    setVideoEnabled(videoTrack.enabled);
  };

  const toggleAudio = () => {
    const audioTrack = localStreamRef.current.getAudioTracks()[0];
    audioTrack.enabled = !audioTrack.enabled;
    setAudioEnabled(audioTrack.enabled);
  };

  const sendMessage = () => {
    if (newMessage.trim() !== "") {
      socket.emit("chat-message", { roomId, message: newMessage });
      setMessages((prev) => [...prev, { sender: "You", text: newMessage }]);
      setNewMessage("");
    }
  };

  const startScreenShare = async () => {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    const screenTrack = screenStream.getVideoTracks()[0];

    const sender = peerConnectionRef.current
      .getSenders()
      .find((s) => s.track.kind === "video");

    sender.replaceTrack(screenTrack);

    screenTrack.onended = async () => {
      const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
      sender.replaceTrack(cameraStream.getVideoTracks()[0]);
    };
  };

  useEffect(() => {
    socket.on("offer", async ({ offer }) => {
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      socket.emit("answer", { roomId, answer });
    });

    socket.on("answer", async ({ answer }) => {
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on("ice-candidate", ({ candidate }) => {
      peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    });

    socket.on("user-joined", async () => {
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      socket.emit("offer", { roomId, offer });
    });

    socket.on("chat-message", ({ message }) => {
      setMessages((prev) => [...prev, { sender: "Other", text: message }]);
    });

    return () => socket.disconnect();
  }, [roomId]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Video Call Room</h2>
      {!joined ? (
        <div className="mb-4">
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="border p-2 mr-2"
            placeholder="Enter Room ID"
          />
          <button
            onClick={joinRoom}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Join
          </button>
        </div>
      ) : (
        <>
          <div className="flex gap-2 mb-4">
            <button
              onClick={startScreenShare}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Share Screen
            </button>
            <button
              onClick={toggleVideo}
              className="bg-yellow-600 text-white px-4 py-2 rounded"
            >
              {videoEnabled ? "Turn Off Video" : "Turn On Video"}
            </button>
            <button
              onClick={toggleAudio}
              className="bg-purple-600 text-white px-4 py-2 rounded"
            >
              {audioEnabled ? "Mute" : "Unmute"}
            </button>
          </div>
        </>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <video ref={localVideoRef} autoPlay muted playsInline className="w-full border" />
        <video ref={remoteVideoRef} autoPlay playsInline className="w-full border" />
      </div>

      {/* Chat Section */}
      {joined && (
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold mb-2">Chat</h3>
          <div className="h-40 overflow-y-auto border p-2 mb-2 bg-white text-black rounded">
            {messages.map((msg, idx) => (
              <div key={idx}>
                <strong>{msg.sender}: </strong> {msg.text}
              </div>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="border p-2 flex-grow mr-2 rounded"
              placeholder="Type a message"
            />
            <button
              onClick={sendMessage}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
