import axios from 'axios';

const BASE_URL = 'https://openlibrary.org';

export const searchBooks = async (query: string) => {
  const response = await axios.get(`${BASE_URL}/search.json`, {
    params: { q: query }
  });
  return response.data;
};

export const getBookDetails = async (workId: string) => {
  const response = await axios.get(`${BASE_URL}/works/${workId}.json`);
  return response.data;
};
