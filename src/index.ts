import { server } from './http/server';
import 'dotenv/config';

server.listen(process.env.PORT, () =>
  console.log('- Server is running on port ' + process.env.PORT)
);
