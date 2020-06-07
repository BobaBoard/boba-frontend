import axios from "axios";

export const getBoardData = async (key: string, { slug }: { slug: string }) => {
  const response = await axios.get(`boards/${slug}`);
  return response.data;
};

export const getBoardActivityData = async (
  key: string,
  { slug }: { slug: string }
) => {
  const response = await axios.get(`boards/${slug}/activity/latest`);
  if (response.status == 204) {
    // No data, let's return empty array
    return [];
  }
  return response.data;
};

export const getThreadData = async (
  key: string,
  { threadId }: { threadId: string }
) => {
  const response = await axios.get(`threads/${threadId}/`);
  return response.data;
};

export const getAllBoardsData = async (key: string) => {
  const response = await axios.get(`boards`);
  return response.data;
};
