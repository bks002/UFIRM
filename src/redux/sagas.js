import { all } from 'redux-saga/effects';
import commonSaga from './department/saga';

export default function* rootSaga() {
  yield all([
    commonSaga(),
  ]);
}
