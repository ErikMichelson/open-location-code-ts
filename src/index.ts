// Copyright 2014 Google Inc. All rights reserved.
// Copyright 2025 Google Inc., Open Location Code Contributors, Erik Michelson.
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
export { CodeArea } from "./code-area";
export { CODE_PRECISION_EXTRA, CODE_PRECISION_NORMAL } from "./constants";

import { OpenLocationCode } from "./open-location-code";
export { OpenLocationCode };
export {
  decode,
  encode,
  getAlphabet,
  isFull,
  isShort,
  isValid,
  recoverNearest,
  shorten,
} from "./open-location-code";
