import React, { useRef, useEffect, useState } from "react";
import socket from "../socket";

export default function VideoCall({ currentUserId, selectedUserId, onClose }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const [callActive, setCallActive] = useState(false);

  useEffect(() => {
    if (!currentUserId || !selectedUserId) return;

    socket.on("incoming-call", async ({ from, offer }) => {
      if (from === selectedUserId) {
        const accept = window.confirm("Incoming video call. Accept?");
        if (accept) {
          await setupMedia();
          const peer = createPeer();
          peer.setRemoteDescription(new RTCSessionDescription(offer));

          const answer = await peer.createAnswer();
          await peer.setLocalDescription(answer);
          socket.emit("answer-call", {
            to: from,
            answer,
          });

          setCallActive(true);
        }
      }
    });

    socket.on("call-answered", async ({ answer }) => {
      await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      try {
        await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error("Error adding received ice candidate", err);
      }
    });

    socket.on("call-ended", () => {
      endCall();
    });

    return () => {
      socket.off("incoming-call");
      socket.off("call-answered");
      socket.off("ice-candidate");
      socket.off("call-ended");
    };
  }, [selectedUserId]);

  const setupMedia = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideoRef.current.srcObject = stream;
    return stream;
  };

  const createPeer = () => {
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          to: selectedUserId,
          candidate: event.candidate,
        });
      }
    };

    peer.ontrack = (event) => {
      remoteVideoRef.current.srcObject = event.streams[0];
    };

    peerRef.current = peer;
    return peer;
  };

  const startCall = async () => {
    const stream = await setupMedia();
    const peer = createPeer();

    stream.getTracks().forEach((track) => peer.addTrack(track, stream));

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    socket.emit("call-user", {
      to: selectedUserId,
      offer,
      callType: "video",
    });

    setCallActive(true);
  };

  const endCall = () => {
    peerRef.current?.close();
    peerRef.current = null;
    setCallActive(false);

    if (localVideoRef.current?.srcObject) {
      localVideoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }

    socket.emit("end-call", { to: selectedUserId });
    if (onClose) onClose();
  };

  return (
    <div className="mt-4 border rounded-lg bg-white shadow-md p-4 w-full">
      <div className="flex flex-col md:flex-row justify-center gap-4 mb-4">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          className="w-full md:w-1/2 rounded border aspect-video"
        />
        <video
          ref={remoteVideoRef}
          autoPlay
          className="w-full md:w-1/2 rounded border aspect-video"
        />
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        {!callActive ? (
          <button
            onClick={startCall}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Start Call
          </button>
        ) : (
          <button
            onClick={endCall}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            End Call
          </button>
        )}
        <button
          onClick={endCall}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
}
