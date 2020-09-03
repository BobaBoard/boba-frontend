import axios from "axios";
import debug from "debug";

const log = debug("bobafrontend:queries:user-log");

export const updateUserData = async (data: {
  avatarUrl: string;
  username: string;
}): Promise<{
  avatarUrl: string;
  username: string;
}> => {
  const response = await axios.post(`/users/me/update`, data);
  log(`Updated user data on server:`);
  log(response.data);
  return response.data;
};
