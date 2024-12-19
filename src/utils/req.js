import axios from "axios";
import { Token } from "./storage";

const baseUrl = "https://3932-38-207-137-250.ngrok-free.app";
const instance = axios.create({
  baseURL: baseUrl,
  timeout: 10000,
});

instance.interceptors.request.use((config) => {
  //config.headers["authorization"] = `${Token.getToken()}`;
  return config;
});

instance.interceptors.response.use(
  (resp) => {
    if (resp.data && resp.data.code === 200) {
      return resp.data;
    } else {
      console.error(resp.data.message);
      return Promise.reject(resp);
    }
  },
  (err) => {
    return Promise.reject(err);
  }
);

export const ApiGet = async (path) => {
  const url = `${path}`;
  return await instance.get(url);
};

export const ApiPost = async (path, data) => {
  const url = `${path}`;
  return await instance.post(url, data);
};
