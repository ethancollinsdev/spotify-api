import fetch from "node-fetch";
import { categories } from "./properties.js";

const { CLIENT_ID, CLIENT_SECRET } = process.env;

const baseURL = "https://api.spotify.com/v1";
let secret;

export const authenticate = async () => {
  const getCurrentSeconds = () => new Date().getTime() / 1000;

  if (secret && secret?.exp > getCurrentSeconds()) return secret;
  const authOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
    }),
  };

  const res = await fetch(
    "https://accounts.spotify.com/api/token",
    authOptions
  );
  const json = await res.json();
  secret = { token: json?.access_token, exp: getCurrentSeconds() + 3540 }; // 59 mins before refreshing
  return json;
};

const search = async ({
  value,
  category = categories.join(","),
  limit = 20,
  offset = 0,
}) => {
  const params = `search?q=${value}&type=${category}&offset=${offset}&limit=${limit}`;
  const options = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${secret.token}`,
    },
  };
  const url = `${baseURL}/${params}`;
  const res = await fetch(url, options);
  return res.json();
};

const artist = async ({ value, market, limit = 20, offset = 0 }) => {
  const artistURL = `${baseURL}/artists/${value}`;

  const urls = {
    metadata: artistURL,
    albums: `${artistURL}/albums?offset=${offset}&limit=${limit}`,
    topTracks: `${artistURL}/top-tracks?market=${market}`,
  };

  const options = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${secret.token}`,
    },
  };

  const response = {};

  for (let key of Object.keys(urls)) {
    const res = await fetch(urls[key], options);
    const json = await res.json();
    response[key] = json;
  }

  return response;
};

export const typeFunctionMap = {
  search,
  artist,
};
