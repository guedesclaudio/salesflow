import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { AxiosInstance } from 'axios';
import axios from 'axios';

@Injectable()
export class HttpService {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  public async get<T = any>(url: string, params?: Record<string, any>): Promise<T> {
    try {
      const response = await this.client.get<T>(url, { params });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  public async post<T = any>(url: string, data: any): Promise<T> {
    try {
      const response = await this.client.post<T>(url, data);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  public handleError(error: any): never {
    const message = error.response?.data || error.message || 'Unknown error';
    const status = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;

    throw new HttpException(message, status);
  }
}
