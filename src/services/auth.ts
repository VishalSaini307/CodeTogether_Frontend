import api from './api';

const LOGIN_MUTATION = `
mutation Login($input: LoginInput!) {
  login(input: $input) {
    token
    user {
      _id
      name
      email
    }
  }
}
`;

const REGISTER_MUTATION = `
mutation Register($input: RegisterInput!) {
  register(input: $input) {
    _id
    name
    email
  }
}
`;


export const loginUser = async ({ email, password }: { email: string; password: string }) => {
  try {
    const res = await api.post('', {
      query: LOGIN_MUTATION,
      variables: { input: { email, password } },
    });

    // GraphQL errors are in res.data.errors
    if (res.data.errors) {
      throw new Error(res.data.errors[0].message);
    }

    const loginData = res.data.data.login;
    // Store userId in localStorage for dashboard filtering
    if (loginData?.user?._id) {
      localStorage.setItem('userId', loginData.user._id);
    }
    return loginData;
  } catch (error: any) {
    throw new Error(error.message || 'Login failed');
  }
};
export const registerUser = async (input: any) => {
  const res = await api.post('', { query: REGISTER_MUTATION, variables: { input } });
  return res.data.data.register;
};

export const createRoom = async (input: { name: string; description?: string; code?: string }) => {
  const mutation = `
    mutation CreateRoom($input: CreateRoomInput!) {
      createRoom(input: $input) {
        _id
        name
        code
        description
      }
    }
  `;
  const res = await api.post('', { query: mutation, variables: { input } });
  const data = res.data as any;
  if (data.errors) throw new Error(data.errors[0].message);
  return data.data.createRoom;
};
export const getRooms = async () => {
  const query = `
    query {
      rooms {
        _id
        name
        code
        owner
        participants
        description
      }
    }
  `;
  const token = localStorage.getItem('jwtToken');
  const res = await api.post('', { query }, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined);
  type RoomResponse = {
    data?: {
      rooms?: Array<{
        _id: string;
        name: string;
        code?: string;
        owner: string;
        participants: string[];
        description?: string;
      }>;
    };
    errors?: { message: string }[];
  };
  const data = res.data as RoomResponse;
  if (data.errors) throw new Error(data.errors[0].message);
  return data.data?.rooms || [];
};

