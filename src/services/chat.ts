import axios from 'axios';

export async function fetchChatMessages(roomId: string) {
  // Update the URL to match backend endpoint
  const res = await axios.get('http://localhost:5000/chat/messages', { params: { roomId } });
  return res.data;
}

export async function sendChatMessage(roomId: string, userId: string, userName: string, message: string) {
  return axios.post('http://localhost:5000/chat/send', { roomId, userId, userName, message });
}
