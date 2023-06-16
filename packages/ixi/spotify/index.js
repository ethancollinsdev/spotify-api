import { authenticate, typeFunctionMap } from "./spotify.js";
import { schema } from "./schema.js";

const buildReturn = (content, statusCode = 200) => {
  const body = typeof content === "string" ? { message: content } : content;
  return {
    body,
    statusCode,
  };
};

export const main = async (input) => {
  try {
    const { error } = schema.validate(input, { allowUnknown: true });
    if (error) throw new Error(error?.details?.[0]?.message);
  } catch (err) {
    return buildReturn(err.message, 400);
  }

  const fn = typeFunctionMap?.[input.type];

  try {
    await authenticate();
  } catch (err) {
    console.error(err?.message);
    return buildReturn("Spotify Authentication Error", 500);
  }

  try {
    const res = await fn(input);
    return buildReturn(res, 200);
  } catch (err) {
    console.error(err?.message);
    return buildReturn(err?.message || "Server Error", 500);
  }
};
