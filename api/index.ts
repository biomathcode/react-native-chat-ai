import { createRequestHandler } from 'expo-server/adapter/vercel';

export default createRequestHandler({
  build: 'dist/server',
});
