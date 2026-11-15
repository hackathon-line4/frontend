// app.json에 더해 빌드할 때만 정하는 값.
const fs = require('fs');
const path = require('path');
const { withAndroidManifest } = require('expo/config-plugins');

// 백엔드 서버가 아직 http(https 아님)라서 출시용(release) 빌드에서도 http 통신을 허용한다.
// 개발 빌드는 이미 허용돼 있지만 release는 기본으로 막혀 서버에 접속하지 못한다.
// 서버가 https가 되면 이 설정은 지운다.
function withCleartextTraffic(config) {
  return withAndroidManifest(config, (mod) => {
    const app = mod.modResults.manifest.application?.[0];
    if (app) app.$['android:usesCleartextTraffic'] = 'true';
    return mod;
  });
}

module.exports = ({ config }) => {
  let next = config;
  // B-8 FCM: google-services.json(백엔드에서 받은 Firebase 앱 설정)이 프로젝트 루트에 있을 때만 넣는다.
  // 파일이 없어도 빌드는 되고, 푸시만 꺼진 채로 동작한다.
  const googleServicesFile = './google-services.json';
  if (fs.existsSync(path.join(__dirname, googleServicesFile))) {
    next = { ...next, android: { ...next.android, googleServicesFile } };
  }
  return withCleartextTraffic(next);
};
