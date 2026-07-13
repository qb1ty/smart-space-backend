import { ConflictException, Logger } from "@nestjs/common";
import { Cache } from "@nestjs/cache-manager";

export async function acquireLock(cache: Cache, key: string, ttlMs = 10000): Promise<void> {
    const existingLock = await cache.get(key)
    if (existingLock !== undefined) {
        throw new ConflictException("Это пространство прямо сейчас бронирует другой человек")
    }

    await cache.set(key, "LOCKED", ttlMs)
}

export async function releaseLock(cache: Cache, key: string, logger: Logger): Promise<void> {
    try {
        await cache.del(key)
    } catch (err: any) {
        logger.error(`Не удалось снять замок Redis [${key}]`, err?.stack || "none")
    }
}