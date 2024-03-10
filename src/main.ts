import {Configuration, OpenAIApi} from 'openai';
import {throwIfMissing} from "./utils";

export default async ({req, res, log, error}) => {
  throwIfMissing(process.env, ['OPENAI_API_KEY']);

  try {
    log("prompt: " + JSON.stringify(req.body));
    throwIfMissing(req.body, ['prompt']);
  } catch (err) {
    error("Invalid request in check ", err.message);
    return res.json({ok: false, error: err.message}, 400);
  }

  const openai = new OpenAIApi(new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  }));

  if (req.method === 'GET') {
    try {
      const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS ?? '512'),
        messages: [{role: 'user', content: req.body.prompt}],
      });
      const completion = response.data.choices[0].message?.content;
      log(completion);
      return res.json({ok: true, completion}, 200);
    } catch (err) {
      error("Invalid request in get ", err.message);
      return res.json({ok: false, error: 'Failed to query model.'}, 500);
    }
  }

};
