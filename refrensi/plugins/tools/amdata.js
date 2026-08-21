/*
 * AM DATA protected module
 * - am-data tetap menjadi nama plugin yang terlihat
 * - AMPREM logic digabung di dalam module ini
 * - dependency anchors: config / rimuru-database / rimuru-error / rimuru-logger
 * - implementation disimpan sebagai compressed+XOR payload untuk mempersulit penyalinan langsung
 */
import axios from "axios";
import zlib from "zlib";
import config from "../../config.js";
import te from "../../src/lib/rimuru-error.js";
import { getDatabase } from "../../src/lib/rimuru-database.js";
import { logger } from "../../src/lib/rimuru-logger.js";

const __amKey = 0xA7;
const __amPayload = [
"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",
"GpVPiiBtT4Z3Y88KkpM+Of/glmA6E2Jxcq9MmA=="
].join("");
const __amBytes = Buffer.from(__amPayload, "base64");
for (let i = 0; i < __amBytes.length; i++) __amBytes[i] ^= (__amKey + i * 31) & 0xFF;
const __amSource = zlib.inflateSync(__amBytes).toString("utf8");
const __amOut = {};
new Function("axios", "config", "te", "getDatabase", "logger", "out", __amSource)(axios, config, te, getDatabase, logger, __amOut);

const { config: pluginConfig, handler, ampremReplyHandler } = __amOut;
export { pluginConfig as config, handler, ampremReplyHandler };
