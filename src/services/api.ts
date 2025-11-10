export const joinRoomWithCode = async (roomId: string, inviteCode: string) => {
  const token = localStorage.getItem('jwtToken');
  if (!token) throw new Error('Please login first!');
  const mutation = `
    mutation JoinRoomWithCode($roomId: String!, $inviteCode: String!) {
      joinRoomWithCode(roomId: $roomId, inviteCode: $inviteCode) {
        _id
        name
        code
      }
    }
  `;
  const res = await api.post('', {
    query: mutation,
    variables: { roomId, inviteCode },
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = res.data as {
    data?: { joinRoomWithCode?: { _id: string; name: string; code: string } };
    errors?: { message: string }[];
  };
  if (data.errors) throw new Error(data.errors[0].message);
  return data.data?.joinRoomWithCode;
};
import axios from 'axios';

const api = axios.create({
    baseURL : 'http://localhost:5000/graphql',
     withCredentials: true
});

//JWT attach interceptior

api.interceptors.request.use((config) =>{
    const token = localStorage.getItem('jwtToken')
    if(token){
        config.headers = {...config.headers ,Authorization:`Bearer ${token}`}
    }
    return config;

});

export const runCodeApi = async (language: string, code: string) => {
  const mutation = `
    mutation RunCode($language: String!, $code: String!) {
      runCode(language: $language, code: $code)
    }
  `;
  const res = await api.post('', {
    query: mutation,
    variables: { language, code },
  });
  if (res.data.errors) throw new Error(res.data.errors[0].message);
  return res.data.data.runCode;
};

export const getRoomDetails = async (roomId: string) => {
  const query = `
    query Room($id: String!) {
      room(id: $id) {
        _id
        name
        code
      }
    }
  `;
  try {
    const res = await api.post('', {
      query,
      variables: { id: roomId },
    });
    const data = res.data as {
      data?: { room?: { _id: string; name: string; code: string } };
      errors?: { message: string }[];
    };
    if (data.errors) {
      console.error('Room fetch error:', data.errors[0].message);
      return null;
    }
    return data.data?.room || null;
  } catch (err) {
    console.error('Room fetch exception:', err);
    return null;
  }
};

export default api;