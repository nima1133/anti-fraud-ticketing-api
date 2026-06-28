import jwt, { SignOptions } from 'jsonwebtoken';
import 'dotenv/config';
const createToken = (id: number) => {
  const accessToken = jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN as SignOptions['expiresIn'],
  });
  const refreshToken = jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN as SignOptions['expiresIn'],
  });
  return { accessToken, refreshToken };
};
export default createToken;
