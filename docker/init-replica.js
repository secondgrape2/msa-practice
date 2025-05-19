// init-mongo-very-simple.js
const { MongoClient } = require('mongodb');

(async () => {
  const client = new MongoClient('mongodb://mongo1:27017', {
    directConnection: true,
  });
  try {
    await client.connect();
    const adminDb = client.db('admin');
    // 별도 상태 확인 없이 바로 초기화 시도
    await adminDb.command({
      replSetInitiate: {
        _id: 'rs0',
        members: [
          { _id: 0, host: 'mongo1:27017', priority: 2 },
          { _id: 1, host: 'mongo2:27018', priority: 1 },
          { _id: 2, host: 'mongo3:27019', priority: 0 },
        ],
      },
    });
    console.log('Replica set initiation command sent.');
  } catch (e) {
    // 이미 초기화된 경우 발생하는 에러는 정상으로 간주
    if (
      e.codeName === 'AlreadyInitialized' ||
      (e.message && e.message.includes('already initialized'))
    ) {
      console.log('Replica set appears to be already initialized.');
    } else {
      console.error('Error during replica set initiation:', e.message);
      process.exit(1); // 그 외 에러는 실패로 처리
    }
  } finally {
    if (client) await client.close();
  }
})();
