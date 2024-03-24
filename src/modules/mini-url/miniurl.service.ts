import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RedisCache } from '@tirke/node-cache-manager-ioredis';

import { MiniUrl } from '@schema';
import { generateUnique } from '@helpers';

const { DOMAIN } = process.env;

@Injectable()
export class MiniUrlService {
  constructor(
    @InjectModel(MiniUrl.name) private miniUrl: Model<MiniUrl>,
    @Inject(CACHE_MANAGER) private redisCache: RedisCache,
  ) {}

  getRedisKey(params: string): string {
    return `miniurl:${params}`;
  }

  async generateMID(): Promise<string> {
    try {
      const mid = generateUnique();

      const checkExists = await this.miniUrl
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

  async createMiniUrl(url: string): Promise<{ shortUrl: string; mid: string }> {
    try {
      const startTime = Date.now();

      const mid = await this.generateMID();
      const cacheKey = this.getRedisKey(mid);

      const shortUrl = `${DOMAIN}/mini/${mid}`;

      await Promise.all([
        this.miniUrl.create({
          shortUrl,
          originalUrl: url,
          mid,
        }),
        this.redisCache.set(cacheKey, url, 60 * 60), // 1 hour
      ]);

      console.log('Time elapsed:', Date.now() - startTime, shortUrl);
      return { shortUrl, mid };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getMiniUrl(mid: string): Promise<string> {
    try {
      const cacheKey = this.getRedisKey(mid);

      const originalUrl = await this.redisCache.get<string>(cacheKey);
      if (originalUrl) return originalUrl;

      // const count = await this.miniUrl.countDocuments();
      // const randomIndex = Math.floor(Math.random() * count);

      const result = await this.miniUrl
        .findOne({ mid })
        .select('originalUrl')
        // .skip(randomIndex)
        .lean();

      if (!result) {
        throw new HttpException('Not Found Mini Link', HttpStatus.NOT_FOUND);
      }

      await this.redisCache.set(cacheKey, result.originalUrl, 60 * 60);

      return result.originalUrl;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteMiniUrl(mid: string): Promise<void> {
    try {
      const cacheKey = this.getRedisKey(mid);
      await Promise.all([
        this.miniUrl.deleteOne({ mid }),
        this.redisCache.del(cacheKey),
      ]);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
