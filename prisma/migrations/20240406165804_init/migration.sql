-- CreateEnum
CREATE TYPE "Direction" AS ENUM ('IN', 'OUT');

-- CreateEnum
CREATE TYPE "Day" AS ENUM ('Weekday', 'Saturday', 'Sunday');

-- CreateEnum
CREATE TYPE "Line" AS ENUM ('GRN', 'YEL');

-- CreateTable
CREATE TABLE "Station" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "Station_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Platform" (
    "id" SERIAL NOT NULL,
    "number" INTEGER NOT NULL,
    "direction" "Direction" NOT NULL,
    "text" TEXT NOT NULL,
    "stationId" INTEGER NOT NULL,

    CONSTRAINT "Platform_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stop" (
    "id" SERIAL NOT NULL,
    "line" "Line" NOT NULL,
    "time" INTEGER NOT NULL,
    "day" "Day" NOT NULL,
    "platformId" INTEGER NOT NULL,
    "serviceId" INTEGER,
    "terminates" TEXT,

    CONSTRAINT "Stop_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Platform" ADD CONSTRAINT "Platform_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stop" ADD CONSTRAINT "Stop_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stop" ADD CONSTRAINT "Stop_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;
