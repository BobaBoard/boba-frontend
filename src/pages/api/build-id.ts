import { NextApiRequest, NextApiResponse } from "next";

// See: https://walrus.ai/blog/2021/04/prompting-users-to-reload-your-next-js-app-after-an-update/
export default (_req: NextApiRequest, res: NextApiResponse): void => {
  res.status(200).json({
    buildId: process.env.BUILD_ID,
  });
};
