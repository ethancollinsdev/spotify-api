import Joi from "joi";
import { categories, markets } from "./properties.js";
import { typeFunctionMap } from "./spotify.js";

const formatArray = (array) => array.map((item) => `'${item}'`).join(", ");

const validFunctions = Object.keys(typeFunctionMap);

export const schema = Joi.object({
  type: Joi.string()
    .valid(...validFunctions)
    .required()
    .messages({
      "any.required": `Missing Required Param 'type'`,
      "any.only": `Allowed 'type' param values are: [${formatArray(
        validFunctions
      )}]`,
    }),
  value: Joi.string().required().messages({
    "any.required": `Missing Required Param 'value'`,
  }),
  category: Joi.string()
    .valid(...categories)
    .messages({
      "any.only": `Allowed 'category' param values are: [${formatArray(
        categories
      )}]`,
    }),
  market: Joi.when("type", {
    is: "artist",
    then: Joi.string()
      .valid(...markets)
      .required(),
  }).messages({
    "any.required": `Missing Required Param 'market'`,
    "any.only": `Allowed 'market' param values are: [${formatArray(markets)}]`,
  }),
  offset: Joi.number().min(0).messages({
    "number.base": `Param 'offset' must be a number`,
    "number.min": `Param 'offset' must be at least 0`,
  }),
  limit: Joi.number().min(1).max(50).messages({
    "number.base": `Param 'limit' must be a number`,
    "number.min": `Param 'limit' must be at least 1`,
    "number.max": `Param 'limit' values must be in range 1-50`,
  }),
});
