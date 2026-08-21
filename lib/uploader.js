import axios from 'axios';
import FormData from 'form-data';
import { fileTypeFromBuffer } from 'file-type';

/**
 * Uploads a buffer to Catbox CDN
 */
export async function uploadToCatbox(buffer) {
  try {
    const fileType = await fileTypeFromBuffer(buffer) || { ext: 'bin', mime: 'application/octet-stream' };
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', buffer, {
      filename: `upload_${Date.now()}.${fileType.ext}`,
      contentType: fileType.mime
    });

    const response = await axios.post('https://catbox.moe/user/api.php', form, {
      headers: form.getHeaders(),
      timeout: 30000
    });

    return response.data;
  } catch (err) {
    throw new Error(`Failed to upload to Catbox: ${err.message}`);
  }
}

export default uploadToCatbox;
