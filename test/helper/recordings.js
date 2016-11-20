import { join } from 'path';
import { existsSync, readFile, writeFile } from 'fs';

const UPDATE_RECORDINGS = process.argv.includes('--updateSnapshot') || process.argv.includes('-u');
const EXPECTED_FIXTURES_ROOT = join(__dirname, '../fixtures/expected');
console.log(EXPECTED_FIXTURES_ROOT);

function recordingPath(spec) {
  const filename = spec.result.fullName.replace(/\s/g, '-') + '.json';
  return join(EXPECTED_FIXTURES_ROOT, filename);
}

function readRecording(path) {
  return new Promise((resolve, reject) => {
    readFile(path, { encoding: 'utf-8' }, (error, data) => {
      error ? reject(error) : resolve(data);
    });
  }).then(data => JSON.parse(data));
}

function writeRecording(path, recording) {
  return new Promise((resolve, reject) => {
    writeFile(path, JSON.stringify(recording, null, 2), error => {
      error ? reject(error) : resolve();
    });
  });
}

export default function itMatchesRecording(query) {
  const spec = it('matches the recorded data', () => {
    return runQuery(query).then(result => {
      const path = recordingPath(spec);
      if (!UPDATE_RECORDINGS && existsSync(path)) {
        return readRecording(path).then(recording => expect(recording).to.eql(result));
      }
      return writeRecording(path, result);
    });
  });
}
