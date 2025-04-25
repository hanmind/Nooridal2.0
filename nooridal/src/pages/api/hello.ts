import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    res
      .status(200)
      .json({ message: "next.js api만들기! get으로 데이터 가져온겁니다." });
  } else {
    res.status(405).json({ message: "지원하지 않는 메서드입니다." });
  }
}
