// src/services/geminiService.ts
import { GoogleGenerativeAI, GenerativeModel, GenerateContentResult } from '@google/generative-ai';
import { geminiConfig, aiAnalysisConfig } from '../config/aiConfig';

export interface GeminiRequest {
  prompt: string;
  context?: Record<string, any>;
  temperature?: number;
  maxTokens?: number;
}

export interface GeminiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  confidence?: number;
  metadata?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    processingTime: number;
  };
}

export interface AnalysisResult {
  category: string;
  title: string;
  description: string;
  confidence: number;
  supportingData: Record<string, any>;
  predictedImpact: string;
  recommendations: string[];
}

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;
  private requestCount: number = 0;
  private lastResetTime: number = Date.now();

  constructor() {
    if (!geminiConfig.apiKey) {
      throw new Error('Gemini API key is not configured');
    }

    this.genAI = new GoogleGenerativeAI(geminiConfig.apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: geminiConfig.model,
      generationConfig: geminiConfig.generationConfig,
      safetySettings: geminiConfig.safetySettings
    });

    console.log('✅ Gemini AI Service initialized');
  }

  // Rate limiting check
  private checkRateLimit(): boolean {
    const now = Date.now();
    const timeDiff = now - this.lastResetTime;

    // Reset counter every minute
    if (timeDiff >= 60000) {
      this.requestCount = 0;
      this.lastResetTime = now;
    }

    if (this.requestCount >= aiAnalysisConfig.rateLimitPerMinute) {
      return false;
    }

    this.requestCount++;
    return true;
  }

  // Retry mechanism with exponential backoff
  private async retryRequest<T>(
    operation: () => Promise<T>,
    attempts: number = aiAnalysisConfig.retryAttempts
  ): Promise<T> {
    for (let i = 0; i < attempts; i++) {
      try {
        return await operation();
      } catch (error: any) {
        const isLastAttempt = i === attempts - 1;
        
        if (isLastAttempt) {
          throw error;
        }

        // Exponential backoff: 1s, 2s, 4s, etc.
        const delay = aiAnalysisConfig.retryDelay * Math.pow(2, i);
        console.warn(`Gemini request failed (attempt ${i + 1}/${attempts}), retrying in ${delay}ms...`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw new Error('All retry attempts exhausted');
  }

  // Generate content with timeout and error handling
  public async generateContent<T = any>(request: GeminiRequest): Promise<GeminiResponse<T>> {
    const startTime = Date.now();

    try {
      // Check rate limiting
      if (!this.checkRateLimit()) {
        return {
          success: false,
          error: 'Rate limit exceeded. Please try again later.'
        };
      }

      // Prepare the prompt
      const fullPrompt = this.formatPrompt(request);

      // Make request with retry mechanism
      const result = await this.retryRequest(async () => {
        const promise = this.model.generateContent(fullPrompt);
        
        // Add timeout
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), aiAnalysisConfig.requestTimeout);
        });

        return Promise.race([promise, timeoutPromise]);
      });

      // Process response
      const response = await result.response;
      const text = response.text();
      
      const processingTime = Date.now() - startTime;

      // Try to parse JSON response
      let parsedData: T;
      try {
        parsedData = JSON.parse(text);
      } catch (parseError) {
        console.warn('Failed to parse Gemini response as JSON:', text);
        parsedData = text as T;
      }

      // Calculate confidence (simplified - you can improve this)
      const confidence = this.calculateConfidence(text, request);

      return {
        success: true,
        data: parsedData,
        confidence,
        metadata: {
          promptTokens: this.estimateTokens(fullPrompt),
          completionTokens: this.estimateTokens(text),
          totalTokens: this.estimateTokens(fullPrompt + text),
          processingTime
        }
      };

    } catch (error: any) {
      console.error('Gemini API Error:', error);
      
      return {
        success: false,
        error: this.formatError(error),
        metadata: {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
          processingTime: Date.now() - startTime
        }
      };
    }
  }

  // Format prompt with context
  private formatPrompt(request: GeminiRequest): string {
    let prompt = request.prompt;

    if (request.context) {
      const contextString = JSON.stringify(request.context, null, 2);
      prompt = `Context Data:\n${contextString}\n\nAnalysis Request:\n${prompt}`;
    }

    return prompt;
  }

  // Calculate confidence score (simplified)
  private calculateConfidence(response: string, request: GeminiRequest): number {
    let confidence = 0.5; // Base confidence

    // Increase confidence based on response length and structure
    if (response.length > 100) confidence += 0.1;
    if (response.length > 500) confidence += 0.1;
    
    // Check for JSON structure
    try {
      JSON.parse(response);
      confidence += 0.2;
    } catch (e) {
      // Not JSON, but might still be good
    }

    // Check for keywords that indicate good analysis
    const qualityKeywords = [
      'analisis', 'rekomendasi', 'data', 'berdasarkan', 
      'peningkatan', 'perbaikan', 'strategi', 'implementasi'
    ];
    
    const keywordCount = qualityKeywords.filter(keyword => 
      response.toLowerCase().includes(keyword)
    ).length;
    
    confidence += (keywordCount / qualityKeywords.length) * 0.2;

    return Math.min(confidence, 1.0);
  }

  // Estimate token count (rough approximation)
  private estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token for Indonesian text
    return Math.ceil(text.length / 4);
  }

  // Format error messages
  private formatError(error: any): string {
    if (error.message?.includes('API key')) {
      return 'API key tidak valid atau tidak dikonfigurasi';
    }
    
    if (error.message?.includes('quota')) {
      return 'Kuota API telah habis';
    }
    
    if (error.message?.includes('timeout')) {
      return 'Request timeout - silakan coba lagi';
    }
    
    if (error.message?.includes('rate limit')) {
      return 'Rate limit exceeded - terlalu banyak request';
    }

    return error.message || 'Terjadi kesalahan pada AI service';
  }

  // Specialized methods for different analysis types
  public async analyzeAcademicData(data: any): Promise<GeminiResponse<AnalysisResult[]>> {
    const prompt = `
Analisis data akademik sekolah dasar berikut dan berikan rekomendasi untuk peningkatan:

Instruksi:
1. Identifikasi siswa atau kelas dengan performa di bawah standar
2. Berikan rekomendasi konkret untuk perbaikan
3. Estimasi dampak dari implementasi rekomendasi
4. Berikan confidence level untuk setiap rekomendasi

Format response dalam JSON array dengan struktur:
{
  "category": "academic",
  "title": "Judul rekomendasi",
  "description": "Deskripsi detail rekomendasi", 
  "confidence": 0.8,
  "supportingData": { data pendukung },
  "predictedImpact": "Prediksi dampak",
  "recommendations": ["langkah 1", "langkah 2"]
}
`;

    return this.generateContent<AnalysisResult[]>({
      prompt,
      context: data,
      temperature: 0.3 // Lower temperature for more consistent analysis
    });
  }

  public async analyzeFinancialData(data: any): Promise<GeminiResponse<AnalysisResult[]>> {
    const prompt = `
Analisis data keuangan sekolah berikut dan identifikasi peluang penghematan atau optimalisasi:

Instruksi:
1. Identifikasi kategori pengeluaran yang bisa dioptimalkan
2. Hitung potensi penghematan
3. Berikan strategi implementasi
4. Evaluasi risiko dari setiap rekomendasi

Berikan response dalam format JSON array yang sama seperti analisis akademik.
`;

    return this.generateContent<AnalysisResult[]>({
      prompt,
      context: data,
      temperature: 0.4
    });
  }

  public async analyzeAssetData(data: any): Promise<GeminiResponse<AnalysisResult[]>> {
    const prompt = `
Analisis data aset sekolah dan prediksi kebutuhan pemeliharaan:

Instruksi:
1. Identifikasi aset yang memerlukan pemeliharaan preventif
2. Prediksi biaya pemeliharaan vs penggantian
3. Prioritaskan berdasarkan urgency dan impact
4. Berikan timeline implementasi

Format response dalam JSON array dengan struktur yang sama.
`;

    return this.generateContent<AnalysisResult[]>({
      prompt,
      context: data,
      temperature: 0.3
    });
  }

  public async analyzeTeacherData(data: any): Promise<GeminiResponse<AnalysisResult[]>> {
    const prompt = `
Analisis data kinerja guru dan identifikasi kebutuhan pengembangan:

Instruksi:
1. Identifikasi guru yang memerlukan pelatihan tambahan
2. Rekomendasi program pengembangan yang sesuai
3. Estimasi dampak terhadap kualitas pengajaran
4. Berikan metrik untuk mengukur keberhasilan

Format response dalam JSON array dengan struktur yang sama.
`;

    return this.generateContent<AnalysisResult[]>({
      prompt,
      context: data,
      temperature: 0.4
    });
  }

  // Health check
  public async healthCheck(): Promise<GeminiResponse<{ status: string }>> {
    try {
      const result = await this.generateContent({
        prompt: 'Respond with JSON: {"status": "healthy", "message": "AI service is working"}',
        temperature: 0.1
      });

      return result;
    } catch (error) {
      return {
        success: false,
        error: 'AI service health check failed'
      };
    }
  }

  // Get service statistics
  public getStats() {
    return {
      requestCount: this.requestCount,
      rateLimitPerMinute: aiAnalysisConfig.rateLimitPerMinute,
      remainingRequests: aiAnalysisConfig.rateLimitPerMinute - this.requestCount,
      lastResetTime: this.lastResetTime,
      isRateLimited: this.requestCount >= aiAnalysisConfig.rateLimitPerMinute
    };
  }
}

// Export singleton instance
export const geminiService = new GeminiService();
export default geminiService;