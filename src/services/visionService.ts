import axios from 'axios';
import { API_URL } from '../config';

export interface RecognizedMonument {
  name: string;
  location: string;
  country: string;
  region: string;
  century: string;
  style: string;
  description: string;
  history: string;
  funFacts: string[];
  confidence: number;
}

class VisionService {
  async recognizeMonument(imageBase64: string, language?: string): Promise<RecognizedMonument> {
    const response = await axios.post(`${API_URL}/api/vision/recognize`, {
      imageBase64,
      language,
    });

    if (response.data.success) {
      return response.data.monument;
    }

    throw new Error(response.data.message || 'Falha ao reconhecer monumento');
  }
}

const visionService = new VisionService();
export default visionService;
