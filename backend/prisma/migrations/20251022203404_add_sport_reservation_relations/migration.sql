/*
  Warnings:

  - You are about to drop the column `capacity` on the `rooms` table. All the data in the column will be lost.
  - You are about to drop the column `price_per_day` on the `rooms` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `rooms` table. All the data in the column will be lost.
  - Added the required column `room_type_id` to the `rooms` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[rooms] DROP COLUMN [capacity],
[price_per_day],
[type];
ALTER TABLE [dbo].[rooms] ADD [room_type_id] INT NOT NULL;

-- CreateTable
CREATE TABLE [dbo].[room_types] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(100) NOT NULL,
    [description] NVARCHAR(500),
    [base_price] DECIMAL(10,2) NOT NULL,
    [max_occupancy] INT NOT NULL,
    [bed_type] NVARCHAR(50),
    [size] DECIMAL(10,2),
    [amenities] NVARCHAR(max),
    [images] NVARCHAR(max),
    [company_id] INT NOT NULL,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [room_types_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    [deleted_at] DATETIME2,
    [created_by] INT NOT NULL,
    [updated_by] INT NOT NULL,
    [deleted_by] INT,
    CONSTRAINT [room_types_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [room_types_company_id_name_key] UNIQUE NONCLUSTERED ([company_id],[name])
);

-- CreateTable
CREATE TABLE [dbo].[restaurant_tables] (
    [id] INT NOT NULL IDENTITY(1,1),
    [table_number] NVARCHAR(50) NOT NULL,
    [capacity] INT NOT NULL,
    [location] NVARCHAR(100),
    [description] NVARCHAR(500),
    [status] NVARCHAR(50) NOT NULL CONSTRAINT [restaurant_tables_status_df] DEFAULT 'AVAILABLE',
    [current_order_id] INT,
    [company_id] INT NOT NULL,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [restaurant_tables_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    [deleted_at] DATETIME2,
    [created_by] INT NOT NULL,
    [updated_by] INT NOT NULL,
    [deleted_by] INT,
    CONSTRAINT [restaurant_tables_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [restaurant_tables_current_order_id_key] UNIQUE NONCLUSTERED ([current_order_id]),
    CONSTRAINT [restaurant_tables_company_id_table_number_key] UNIQUE NONCLUSTERED ([company_id],[table_number])
);

-- AddForeignKey
ALTER TABLE [dbo].[room_types] ADD CONSTRAINT [room_types_company_id_fkey] FOREIGN KEY ([company_id]) REFERENCES [dbo].[companies]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[room_types] ADD CONSTRAINT [room_types_created_by_fkey] FOREIGN KEY ([created_by]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[room_types] ADD CONSTRAINT [room_types_updated_by_fkey] FOREIGN KEY ([updated_by]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[room_types] ADD CONSTRAINT [room_types_deleted_by_fkey] FOREIGN KEY ([deleted_by]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[rooms] ADD CONSTRAINT [rooms_room_type_id_fkey] FOREIGN KEY ([room_type_id]) REFERENCES [dbo].[room_types]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[restaurant_tables] ADD CONSTRAINT [restaurant_tables_company_id_fkey] FOREIGN KEY ([company_id]) REFERENCES [dbo].[companies]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[restaurant_tables] ADD CONSTRAINT [restaurant_tables_current_order_id_fkey] FOREIGN KEY ([current_order_id]) REFERENCES [dbo].[restaurant_orders]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[restaurant_tables] ADD CONSTRAINT [restaurant_tables_created_by_fkey] FOREIGN KEY ([created_by]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[restaurant_tables] ADD CONSTRAINT [restaurant_tables_updated_by_fkey] FOREIGN KEY ([updated_by]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[restaurant_tables] ADD CONSTRAINT [restaurant_tables_deleted_by_fkey] FOREIGN KEY ([deleted_by]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
