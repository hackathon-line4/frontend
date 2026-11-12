// app.json에 더해 빌드할 때만 정하는 값.
// B-8 FCM: google-services.json(백엔드에서 받은 Firebase 앱 설정)이 프로젝트 루트에 있을 때만 넣는다.
// 파일이 없어도 빌드는 되고, 푸시만 꺼진 채로 동작한다.
const fs = require('fs');
const path = require('path');

module.exports = ({ config }) => {
  const googleServicesFile = './google-services.json';
  if (!fs.existsSync(path.join(__dirname, googleServicesFile))) return config;
  return { ...config, android: { ...config.android, googleServicesFile } };
};
