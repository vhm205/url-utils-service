import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RedisCache } from '@tirke/node-cache-manager-ioredis';

import { HiddenUrl } from '@schema';
import { generateUnique } from '@helpers';
import { ResponseType } from '@common';

const { DOMAIN } = process.env;

@Injectable()
export class HiddenUrlService {
  constructor(
    @InjectModel(HiddenUrl.name) private hiddenUrl: Model<HiddenUrl>,
    @Inject(CACHE_MANAGER) private redisCache: RedisCache,
  ) {}

  getRedisKey(params: string): string {
    return `hidden-url:${params}`;
  }

  async generateMID(): Promise<string> {
    try {
      const mid = generateUnique();

      const checkExists = await this.hiddenUrl
        .findOne({ mid })
        .select('mid')
        .lean();

      if (checkExists) {
        const key = this.getRedisKey(`${mid}:duplicate:count`);
        await this.redisCache.store.client.incr(key);
        return await this.generateMID();
      }

      return mid;
    } catch (error) {
      return await this.generateMID();
    }
  }

  async createHiddenUrl(
    url: string,
  ): Promise<{ shortUrl: string; mid: string }> {
    try {
      const mid = await this.generateMID();
      const cacheKey = this.getRedisKey(mid);

      const shortUrl = `${DOMAIN}/hidden/${mid}`;

      await Promise.all([
        this.hiddenUrl.create({
          shortUrl,
          hiddenUrl: url,
          mid,
        }),
        this.redisCache.set(cacheKey, url, 60 * 60), // 1 hour
      ]);

      return { shortUrl, mid };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getHiddenUrl(mid: string): Promise<string> {
    try {
      const cacheKey = this.getRedisKey(mid);

      const originalUrl = await this.redisCache.get<string>(cacheKey);
      if (originalUrl) return originalUrl;

      const result = await this.hiddenUrl.findOne({ mid }).lean();

      if (!result) {
        throw new HttpException('Not Found Mini Link', HttpStatus.NOT_FOUND);
      }

      return result.hiddenUrl;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateHiddenUrl(
    mid: string,
    url: string,
  ): Promise<{ shortUrl: string; mid: string }> {
    try {
      const cacheKey = this.getRedisKey(mid);
      await Promise.all([
        this.hiddenUrl.updateOne({ mid }, { originalUrl: url }),
        this.redisCache.set(cacheKey, url, 60 * 60), // 1 hour
      ]);

      return {
        shortUrl: `${DOMAIN}/hidden/${mid}`,
        mid,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteHiddenUrl(mid: string): Promise<ResponseType> {
    try {
      const cacheKey = this.getRedisKey(mid);
      await Promise.all([
        this.hiddenUrl.deleteOne({ mid }),
        this.redisCache.del(cacheKey),
      ]);
      return {
        status: HttpStatus.NO_CONTENT,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
