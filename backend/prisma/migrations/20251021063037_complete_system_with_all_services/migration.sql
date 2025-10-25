BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[companies] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(100) NOT NULL,
    [company_address] NVARCHAR(255),
    [phone] NVARCHAR(20),
    [email] NVARCHAR(255),
    [created_at] DATETIME2 NOT NULL CONSTRAINT [companies_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    [deleted_at] DATETIME2,
    CONSTRAINT [companies_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[users] (
    [id] INT NOT NULL IDENTITY(1,1),
    [email] NVARCHAR(255) NOT NULL,
    [password] NVARCHAR(255) NOT NULL,
    [first_name] NVARCHAR(100) NOT NULL,
    [last_name] NVARCHAR(100) NOT NULL,
    [role] NVARCHAR(50) NOT NULL CONSTRAINT [users_role_df] DEFAULT 'STAFF',
    [status] NVARCHAR(50) NOT NULL CONSTRAINT [users_status_df] DEFAULT 'active',
    [company_id] INT NOT NULL,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [users_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    [deleted_at] DATETIME2,
    [created_by] INT,
    [updated_by] INT,
    [deleted_by] INT,
    CONSTRAINT [users_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [users_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[invitations] (
    [id] INT NOT NULL IDENTITY(1,1),
    [email] NVARCHAR(255) NOT NULL,
    [role] NVARCHAR(50) NOT NULL,
    [token] NVARCHAR(255) NOT NULL,
    [expires_at] DATETIME2 NOT NULL,
    [accepted_at] DATETIME2,
    [company_id] INT NOT NULL,
    [invited_by] INT NOT NULL,
    [accepted_by] INT,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [invitations_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    CONSTRAINT [invitations_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [invitations_token_key] UNIQUE NONCLUSTERED ([token])
);

-- CreateTable
CREATE TABLE [dbo].[rooms] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(100) NOT NULL,
    [room_number] NVARCHAR(50) NOT NULL,
    [floor] INT NOT NULL,
    [type] NVARCHAR(50) NOT NULL,
    [status] NVARCHAR(50) NOT NULL CONSTRAINT [rooms_status_df] DEFAULT 'AVAILABLE',
    [capacity] INT NOT NULL,
    [price_per_day] DECIMAL(10,2) NOT NULL,
    [description] NVARCHAR(500),
    [company_id] INT NOT NULL,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [rooms_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    [deleted_at] DATETIME2,
    [created_by] INT NOT NULL,
    [updated_by] INT NOT NULL,
    [deleted_by] INT,
    CONSTRAINT [rooms_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [rooms_company_id_room_number_key] UNIQUE NONCLUSTERED ([company_id],[room_number])
);

-- CreateTable
CREATE TABLE [dbo].[clients] (
    [id] INT NOT NULL IDENTITY(1,1),
    [first_name] NVARCHAR(100) NOT NULL,
    [last_name] NVARCHAR(100) NOT NULL,
    [email] NVARCHAR(255),
    [phone] NVARCHAR(20),
    [address] NVARCHAR(255),
    [id_number] NVARCHAR(50),
    [customer_type] NVARCHAR(50) NOT NULL CONSTRAINT [clients_customer_type_df] DEFAULT 'WALK_IN',
    [has_account] BIT NOT NULL CONSTRAINT [clients_has_account_df] DEFAULT 0,
    [credit_limit] DECIMAL(10,2),
    [current_balance] DECIMAL(10,2) NOT NULL CONSTRAINT [clients_current_balance_df] DEFAULT 0,
    [sponsor_company_id] INT,
    [employee_id] NVARCHAR(50),
    [department] NVARCHAR(100),
    [company_id] INT NOT NULL,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [clients_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    [deleted_at] DATETIME2,
    [created_by] INT NOT NULL,
    [updated_by] INT NOT NULL,
    [deleted_by] INT,
    CONSTRAINT [clients_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[stays] (
    [id] INT NOT NULL IDENTITY(1,1),
    [room_id] INT NOT NULL,
    [client_id] INT NOT NULL,
    [check_in_date] DATETIME2 NOT NULL,
    [check_out_date] DATETIME2 NOT NULL,
    [actual_check_in] DATETIME2,
    [actual_check_out] DATETIME2,
    [status] NVARCHAR(50) NOT NULL CONSTRAINT [stays_status_df] DEFAULT 'confirmed',
    [adults] INT NOT NULL CONSTRAINT [stays_adults_df] DEFAULT 1,
    [children] INT NOT NULL CONSTRAINT [stays_children_df] DEFAULT 0,
    [total_amount] DECIMAL(10,2) NOT NULL,
    [paid_amount] DECIMAL(10,2) NOT NULL CONSTRAINT [stays_paid_amount_df] DEFAULT 0,
    [notes] NVARCHAR(500),
    [company_id] INT NOT NULL,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [stays_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    [deleted_at] DATETIME2,
    [created_by] INT NOT NULL,
    [updated_by] INT NOT NULL,
    [deleted_by] INT,
    CONSTRAINT [stays_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[categories] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(100) NOT NULL,
    [category_type] NVARCHAR(50) NOT NULL,
    [type] NVARCHAR(50) NOT NULL,
    [description] NVARCHAR(500),
    [company_id] INT NOT NULL,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [categories_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    [deleted_at] DATETIME2,
    [created_by] INT NOT NULL,
    [updated_by] INT NOT NULL,
    [deleted_by] INT,
    CONSTRAINT [categories_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[products] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(200) NOT NULL,
    [category_id] INT NOT NULL,
    [price] DECIMAL(10,2) NOT NULL,
    [unit] NVARCHAR(50) NOT NULL,
    [description] NVARCHAR(500),
    [barcode] NVARCHAR(50),
    [stock] INT NOT NULL CONSTRAINT [products_stock_df] DEFAULT 0,
    [company_id] INT NOT NULL,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [products_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    [deleted_at] DATETIME2,
    [created_by] INT NOT NULL,
    [updated_by] INT NOT NULL,
    [deleted_by] INT,
    CONSTRAINT [products_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[consumptions] (
    [id] INT NOT NULL IDENTITY(1,1),
    [stay_id] INT NOT NULL,
    [product_id] INT NOT NULL,
    [quantity] DECIMAL(10,2) NOT NULL,
    [unit_price] DECIMAL(10,2) NOT NULL,
    [total] DECIMAL(10,2) NOT NULL,
    [date] DATETIME2 NOT NULL,
    [company_id] INT NOT NULL,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [consumptions_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    [deleted_at] DATETIME2,
    [created_by] INT NOT NULL,
    [updated_by] INT NOT NULL,
    [deleted_by] INT,
    CONSTRAINT [consumptions_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[restaurant_orders] (
    [id] INT NOT NULL IDENTITY(1,1),
    [stay_id] INT,
    [client_id] INT NOT NULL,
    [order_date] DATETIME2 NOT NULL,
    [total] DECIMAL(10,2) NOT NULL,
    [status] NVARCHAR(50) NOT NULL,
    [service_mode] NVARCHAR(50) NOT NULL CONSTRAINT [restaurant_orders_service_mode_df] DEFAULT 'WALK_IN',
    [table_number] NVARCHAR(20),
    [payment_status] NVARCHAR(50) NOT NULL CONSTRAINT [restaurant_orders_payment_status_df] DEFAULT 'PENDING',
    [paid_amount] DECIMAL(10,2) NOT NULL CONSTRAINT [restaurant_orders_paid_amount_df] DEFAULT 0,
    [company_id] INT NOT NULL,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [restaurant_orders_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    [deleted_at] DATETIME2,
    [created_by] INT NOT NULL,
    [updated_by] INT NOT NULL,
    [deleted_by] INT,
    CONSTRAINT [restaurant_orders_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[restaurant_order_items] (
    [id] INT NOT NULL IDENTITY(1,1),
    [order_id] INT NOT NULL,
    [product_id] INT NOT NULL,
    [quantity] DECIMAL(10,2) NOT NULL,
    [unit_price] DECIMAL(10,2) NOT NULL,
    [total] DECIMAL(10,2) NOT NULL,
    CONSTRAINT [restaurant_order_items_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[supermarket_orders] (
    [id] INT NOT NULL IDENTITY(1,1),
    [stay_id] INT,
    [client_id] INT NOT NULL,
    [order_date] DATETIME2 NOT NULL,
    [total] DECIMAL(10,2) NOT NULL,
    [status] NVARCHAR(50) NOT NULL,
    [service_mode] NVARCHAR(50) NOT NULL CONSTRAINT [supermarket_orders_service_mode_df] DEFAULT 'WALK_IN',
    [payment_status] NVARCHAR(50) NOT NULL CONSTRAINT [supermarket_orders_payment_status_df] DEFAULT 'PENDING',
    [paid_amount] DECIMAL(10,2) NOT NULL CONSTRAINT [supermarket_orders_paid_amount_df] DEFAULT 0,
    [company_id] INT NOT NULL,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [supermarket_orders_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    [deleted_at] DATETIME2,
    [created_by] INT NOT NULL,
    [updated_by] INT NOT NULL,
    [deleted_by] INT,
    CONSTRAINT [supermarket_orders_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[supermarket_order_items] (
    [id] INT NOT NULL IDENTITY(1,1),
    [order_id] INT NOT NULL,
    [product_id] INT NOT NULL,
    [quantity] DECIMAL(10,2) NOT NULL,
    [unit_price] DECIMAL(10,2) NOT NULL,
    [total] DECIMAL(10,2) NOT NULL,
    CONSTRAINT [supermarket_order_items_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[laundry_orders] (
    [id] INT NOT NULL IDENTITY(1,1),
    [stay_id] INT,
    [client_id] INT NOT NULL,
    [order_date] DATETIME2 NOT NULL,
    [total] DECIMAL(10,2) NOT NULL,
    [status] NVARCHAR(50) NOT NULL,
    [service_mode] NVARCHAR(50) NOT NULL CONSTRAINT [laundry_orders_service_mode_df] DEFAULT 'WALK_IN',
    [pickup_date] DATETIME2,
    [delivery_date] DATETIME2,
    [payment_status] NVARCHAR(50) NOT NULL CONSTRAINT [laundry_orders_payment_status_df] DEFAULT 'PENDING',
    [paid_amount] DECIMAL(10,2) NOT NULL CONSTRAINT [laundry_orders_paid_amount_df] DEFAULT 0,
    [company_id] INT NOT NULL,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [laundry_orders_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    [deleted_at] DATETIME2,
    [created_by] INT NOT NULL,
    [updated_by] INT NOT NULL,
    [deleted_by] INT,
    CONSTRAINT [laundry_orders_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[laundry_order_items] (
    [id] INT NOT NULL IDENTITY(1,1),
    [order_id] INT NOT NULL,
    [product_id] INT NOT NULL,
    [quantity] DECIMAL(10,2) NOT NULL,
    [unit_price] DECIMAL(10,2) NOT NULL,
    [total] DECIMAL(10,2) NOT NULL,
    CONSTRAINT [laundry_order_items_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[sport_reservations] (
    [id] INT NOT NULL IDENTITY(1,1),
    [stay_id] INT,
    [client_id] INT NOT NULL,
    [reservation_date] DATETIME2 NOT NULL,
    [start_time] DATETIME2 NOT NULL,
    [end_time] DATETIME2 NOT NULL,
    [total] DECIMAL(10,2) NOT NULL,
    [status] NVARCHAR(50) NOT NULL,
    [service_mode] NVARCHAR(50) NOT NULL CONSTRAINT [sport_reservations_service_mode_df] DEFAULT 'WALK_IN',
    [facility_type] NVARCHAR(100),
    [payment_status] NVARCHAR(50) NOT NULL CONSTRAINT [sport_reservations_payment_status_df] DEFAULT 'PENDING',
    [paid_amount] DECIMAL(10,2) NOT NULL CONSTRAINT [sport_reservations_paid_amount_df] DEFAULT 0,
    [company_id] INT NOT NULL,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [sport_reservations_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    [deleted_at] DATETIME2,
    [created_by] INT NOT NULL,
    [updated_by] INT NOT NULL,
    [deleted_by] INT,
    CONSTRAINT [sport_reservations_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[sport_reservation_items] (
    [id] INT NOT NULL IDENTITY(1,1),
    [reservation_id] INT NOT NULL,
    [product_id] INT NOT NULL,
    [quantity] DECIMAL(10,2) NOT NULL,
    [unit_price] DECIMAL(10,2) NOT NULL,
    [total] DECIMAL(10,2) NOT NULL,
    CONSTRAINT [sport_reservation_items_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[barber_appointments] (
    [id] INT NOT NULL IDENTITY(1,1),
    [stay_id] INT,
    [client_id] INT NOT NULL,
    [appointment_date] DATETIME2 NOT NULL,
    [start_time] DATETIME2 NOT NULL,
    [end_time] DATETIME2,
    [total] DECIMAL(10,2) NOT NULL,
    [status] NVARCHAR(50) NOT NULL,
    [service_mode] NVARCHAR(50) NOT NULL CONSTRAINT [barber_appointments_service_mode_df] DEFAULT 'WALK_IN',
    [barber_name] NVARCHAR(100),
    [payment_status] NVARCHAR(50) NOT NULL CONSTRAINT [barber_appointments_payment_status_df] DEFAULT 'PENDING',
    [paid_amount] DECIMAL(10,2) NOT NULL CONSTRAINT [barber_appointments_paid_amount_df] DEFAULT 0,
    [company_id] INT NOT NULL,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [barber_appointments_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    [deleted_at] DATETIME2,
    [created_by] INT NOT NULL,
    [updated_by] INT NOT NULL,
    [deleted_by] INT,
    CONSTRAINT [barber_appointments_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[barber_appointment_items] (
    [id] INT NOT NULL IDENTITY(1,1),
    [appointment_id] INT NOT NULL,
    [product_id] INT NOT NULL,
    [quantity] DECIMAL(10,2) NOT NULL,
    [unit_price] DECIMAL(10,2) NOT NULL,
    [total] DECIMAL(10,2) NOT NULL,
    CONSTRAINT [barber_appointment_items_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[payments] (
    [id] INT NOT NULL IDENTITY(1,1),
    [amount] DECIMAL(10,2) NOT NULL,
    [payment_method] NVARCHAR(50) NOT NULL,
    [payment_date] DATETIME2 NOT NULL CONSTRAINT [payments_payment_date_df] DEFAULT CURRENT_TIMESTAMP,
    [status] NVARCHAR(50) NOT NULL CONSTRAINT [payments_status_df] DEFAULT 'COMPLETED',
    [reference] NVARCHAR(100),
    [notes] NVARCHAR(500),
    [restaurant_order_id] INT,
    [supermarket_order_id] INT,
    [laundry_order_id] INT,
    [sport_reservation_id] INT,
    [barber_appointment_id] INT,
    [company_id] INT NOT NULL,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [payments_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    [deleted_at] DATETIME2,
    [created_by] INT NOT NULL,
    [updated_by] INT NOT NULL,
    [deleted_by] INT,
    CONSTRAINT [payments_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[account_transactions] (
    [id] INT NOT NULL IDENTITY(1,1),
    [client_id] INT NOT NULL,
    [transaction_type] NVARCHAR(50) NOT NULL,
    [amount] DECIMAL(10,2) NOT NULL,
    [balance] DECIMAL(10,2) NOT NULL,
    [description] NVARCHAR(500) NOT NULL,
    [reference_type] NVARCHAR(100),
    [reference_id] INT,
    [transaction_date] DATETIME2 NOT NULL CONSTRAINT [account_transactions_transaction_date_df] DEFAULT CURRENT_TIMESTAMP,
    [company_id] INT NOT NULL,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [account_transactions_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    [deleted_at] DATETIME2,
    [created_by] INT NOT NULL,
    [updated_by] INT NOT NULL,
    [deleted_by] INT,
    CONSTRAINT [account_transactions_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[sponsor_accounts] (
    [id] INT NOT NULL IDENTITY(1,1),
    [sponsor_company_id] INT NOT NULL,
    [service_company_id] INT NOT NULL,
    [account_name] NVARCHAR(200) NOT NULL,
    [account_number] NVARCHAR(50),
    [contact_person] NVARCHAR(100),
    [contact_email] NVARCHAR(255),
    [contact_phone] NVARCHAR(20),
    [credit_limit] DECIMAL(10,2),
    [current_balance] DECIMAL(10,2) NOT NULL CONSTRAINT [sponsor_accounts_current_balance_df] DEFAULT 0,
    [payment_terms] NVARCHAR(100),
    [is_active] BIT NOT NULL CONSTRAINT [sponsor_accounts_is_active_df] DEFAULT 1,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [sponsor_accounts_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    [deleted_at] DATETIME2,
    [created_by] INT NOT NULL,
    [updated_by] INT NOT NULL,
    [deleted_by] INT,
    CONSTRAINT [sponsor_accounts_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [sponsor_accounts_account_number_key] UNIQUE NONCLUSTERED ([account_number]),
    CONSTRAINT [sponsor_accounts_sponsor_company_id_service_company_id_key] UNIQUE NONCLUSTERED ([sponsor_company_id],[service_company_id])
);

-- CreateTable
CREATE TABLE [dbo].[invoices] (
    [id] INT NOT NULL IDENTITY(1,1),
    [invoice_number] NVARCHAR(50) NOT NULL,
    [client_id] INT NOT NULL,
    [issue_date] DATETIME2 NOT NULL,
    [due_date] DATETIME2,
    [subtotal] DECIMAL(10,2) NOT NULL,
    [tax] DECIMAL(10,2) NOT NULL,
    [total] DECIMAL(10,2) NOT NULL,
    [status] NVARCHAR(50) NOT NULL,
    [payment_method] NVARCHAR(50),
    [notes] NVARCHAR(500),
    [company_id] INT NOT NULL,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [invoices_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    [deleted_at] DATETIME2,
    [created_by] INT NOT NULL,
    [updated_by] INT NOT NULL,
    [deleted_by] INT,
    CONSTRAINT [invoices_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [invoices_invoice_number_key] UNIQUE NONCLUSTERED ([invoice_number])
);

-- CreateTable
CREATE TABLE [dbo].[licenses] (
    [id] INT NOT NULL IDENTITY(1,1),
    [company_id] INT NOT NULL,
    [plan] NVARCHAR(50) NOT NULL CONSTRAINT [licenses_plan_df] DEFAULT 'TRIAL',
    [status] NVARCHAR(50) NOT NULL CONSTRAINT [licenses_status_df] DEFAULT 'ACTIVE',
    [start_date] DATETIME2 NOT NULL,
    [end_date] DATETIME2 NOT NULL,
    [max_users] INT NOT NULL,
    [max_clients] INT NOT NULL,
    [max_rooms] INT NOT NULL,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [licenses_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    CONSTRAINT [licenses_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [licenses_company_id_key] UNIQUE NONCLUSTERED ([company_id])
);

-- CreateTable
CREATE TABLE [dbo].[audit_logs] (
    [id] INT NOT NULL IDENTITY(1,1),
    [user_id] INT NOT NULL,
    [company_id] INT NOT NULL,
    [action] NVARCHAR(50) NOT NULL,
    [entity] NVARCHAR(100) NOT NULL,
    [entity_id] INT NOT NULL,
    [changes] NVARCHAR(max),
    [ip_address] NVARCHAR(50),
    [user_agent] NVARCHAR(500),
    [created_at] DATETIME2 NOT NULL CONSTRAINT [audit_logs_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [audit_logs_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [account_transactions_client_id_transaction_date_idx] ON [dbo].[account_transactions]([client_id], [transaction_date]);

-- AddForeignKey
ALTER TABLE [dbo].[users] ADD CONSTRAINT [users_company_id_fkey] FOREIGN KEY ([company_id]) REFERENCES [dbo].[companies]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[invitations] ADD CONSTRAINT [invitations_company_id_fkey] FOREIGN KEY ([company_id]) REFERENCES [dbo].[companies]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[invitations] ADD CONSTRAINT [invitations_invited_by_fkey] FOREIGN KEY ([invited_by]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[invitations] ADD CONSTRAINT [invitations_accepted_by_fkey] FOREIGN KEY ([accepted_by]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[rooms] ADD CONSTRAINT [rooms_company_id_fkey] FOREIGN KEY ([company_id]) REFERENCES [dbo].[companies]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[rooms] ADD CONSTRAINT [rooms_created_by_fkey] FOREIGN KEY ([created_by]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[rooms] ADD CONSTRAINT [rooms_updated_by_fkey] FOREIGN KEY ([updated_by]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[rooms] ADD CONSTRAINT [rooms_deleted_by_fkey] FOREIGN KEY ([deleted_by]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[clients] ADD CONSTRAINT [clients_company_id_fkey] FOREIGN KEY ([company_id]) REFERENCES [dbo].[companies]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[clients] ADD CONSTRAINT [clients_sponsor_company_id_fkey] FOREIGN KEY ([sponsor_company_id]) REFERENCES [dbo].[companies]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[clients] ADD CONSTRAINT [clients_created_by_fkey] FOREIGN KEY ([created_by]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[clients] ADD CONSTRAINT [clients_updated_by_fkey] FOREIGN KEY ([updated_by]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[clients] ADD CONSTRAINT [clients_deleted_by_fkey] FOREIGN KEY ([deleted_by]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[stays] ADD CONSTRAINT [stays_company_id_fkey] FOREIGN KEY ([company_id]) REFERENCES [dbo].[companies]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[stays] ADD CONSTRAINT [stays_room_id_fkey] FOREIGN KEY ([room_id]) REFERENCES [dbo].[rooms]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[stays] ADD CONSTRAINT [stays_client_id_fkey] FOREIGN KEY ([client_id]) REFERENCES [dbo].[clients]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[stays] ADD CONSTRAINT [stays_created_by_fkey] FOREIGN KEY ([created_by]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[stays] ADD CONSTRAINT [stays_updated_by_fkey] FOREIGN KEY ([updated_by]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[stays] ADD CONSTRAINT [stays_deleted_by_fkey] FOREIGN KEY ([deleted_by]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[categories] ADD CONSTRAINT [categories_company_id_fkey] FOREIGN KEY ([company_id]) REFERENCES [dbo].[companies]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[categories] ADD CONSTRAINT [categories_created_by_fkey] FOREIGN KEY ([created_by]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[categories] ADD CONSTRAINT [categories_updated_by_fkey] FOREIGN KEY ([updated_by]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[categories] ADD CONSTRAINT [categories_deleted_by_fkey] FOREIGN KEY ([deleted_by]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[products] ADD CONSTRAINT [products_category_id_fkey] FOREIGN KEY ([category_id]) REFERENCES [dbo].[categories]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[products] ADD CONSTRAINT [products_company_id_fkey] FOREIGN KEY ([company_id]) REFERENCES [dbo].[companies]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[products] ADD CONSTRAINT [products_created_by_fkey] FOREIGN KEY ([created_by]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[products] ADD CONSTRAINT [products_updated_by_fkey] FOREIGN KEY ([updated_by]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[products] ADD CONSTRAINT [products_deleted_by_fkey] FOREIGN KEY ([deleted_by]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[consumptions] ADD CONSTRAINT [consumptions_stay_id_fkey] FOREIGN KEY ([stay_id]) REFERENCES [dbo].[stays]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[consumptions] ADD CONSTRAINT [consumptions_product_id_fkey] FOREIGN KEY ([product_id]) REFERENCES [dbo].[products]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[consumptions] ADD CONSTRAINT [consumptions_company_id_fkey] FOREIGN KEY ([company_id]) REFERENCES [dbo].[companies]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[consumptions] ADD CONSTRAINT [consumptions_created_by_fkey] FOREIGN KEY ([created_by]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[consumptions] ADD CONSTRAINT [consumptions_updated_by_fkey] FOREIGN KEY ([updated_by]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[consumptions] ADD CONSTRAINT [consumptions_deleted_by_fkey] FOREIGN KEY ([deleted_by]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[restaurant_orders] ADD CONSTRAINT [restaurant_orders_stay_id_fkey] FOREIGN KEY ([stay_id]) REFERENCES [dbo].[stays]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[restaurant_orders] ADD CONSTRAINT [restaurant_orders_client_id_fkey] FOREIGN KEY ([client_id]) REFERENCES [dbo].[clients]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[restaurant_orders] ADD CONSTRAINT [restaurant_orders_company_id_fkey] FOREIGN KEY ([company_id]) REFERENCES [dbo].[companies]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[restaurant_orders] ADD CONSTRAINT [restaurant_orders_created_by_fkey] FOREIGN KEY ([created_by]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[restaurant_orders] ADD CONSTRAINT [restaurant_orders_updated_by_fkey] FOREIGN KEY ([updated_by]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[restaurant_orders] ADD CONSTRAINT [restaurant_orders_deleted_by_fkey] FOREIGN KEY ([deleted_by]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[restaurant_order_items] ADD CONSTRAINT [restaurant_order_items_order_id_fkey] FOREIGN KEY ([order_id]) REFERENCES [dbo].[restaurant_orders]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[restaurant_order_items] ADD CONSTRAINT [restaurant_order_items_product_id_fkey] FOREIGN KEY ([product_id]) REFERENCES [dbo].[products]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[supermarket_orders] ADD CONSTRAINT [supermarket_orders_stay_id_fkey] FOREIGN KEY ([stay_id]) REFERENCES [dbo].[stays]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[supermarket_orders] ADD CONSTRAINT [supermarket_orders_client_id_fkey] FOREIGN KEY ([client_id]) REFERENCES [dbo].[clients]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[supermarket_orders] ADD CONSTRAINT [supermarket_orders_company_id_fkey] FOREIGN KEY ([company_id]) REFERENCES [dbo].[companies]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[supermarket_orders] ADD CONSTRAINT [supermarket_orders_created_by_fkey] FOREIGN KEY ([created_by]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[supermarket_orders] ADD CONSTRAINT [supermarket_orders_updated_by_fkey] FOREIGN KEY ([updated_by]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[supermarket_orders] ADD CONSTRAINT [supermarket_orders_deleted_by_fkey] FOREIGN KEY ([deleted_by]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[supermarket_order_items] ADD CONSTRAINT [supermarket_order_items_order_id_fkey] FOREIGN KEY ([order_id]) REFERENCES [dbo].[supermarket_orders]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[supermarket_order_items] ADD CONSTRAINT [supermarket_order_items_product_id_fkey] FOREIGN KEY ([product_id]) REFERENCES [dbo].[products]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[laundry_orders] ADD CONSTRAINT [laundry_orders_stay_id_fkey] FOREIGN KEY ([stay_id]) REFERENCES [dbo].[stays]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[laundry_orders] ADD CONSTRAINT [laundry_orders_client_id_fkey] FOREIGN KEY ([client_id]) REFERENCES [dbo].[clients]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[laundry_orders] ADD CONSTRAINT [laundry_orders_company_id_fkey] FOREIGN KEY ([company_id]) REFERENCES [dbo].[companies]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[laundry_orders] ADD CONSTRAINT [laundry_orders_created_by_fkey] FOREIGN KEY ([created_by]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[laundry_orders] ADD CONSTRAINT [laundry_orders_updated_by_fkey] FOREIGN KEY ([updated_by]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[laundry_orders] ADD CONSTRAINT [laundry_orders_deleted_by_fkey] FOREIGN KEY ([deleted_by]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[laundry_order_items] ADD CONSTRAINT [laundry_order_items_order_id_fkey] FOREIGN KEY ([order_id]) REFERENCES [dbo].[laundry_orders]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[laundry_order_items] ADD CONSTRAINT [laundry_order_items_product_id_fkey] FOREIGN KEY ([product_id]) REFERENCES [dbo].[products]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[sport_reservations] ADD CONSTRAINT [sport_reservations_stay_id_fkey] FOREIGN KEY ([stay_id]) REFERENCES [dbo].[stays]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[sport_reservations] ADD CONSTRAINT [sport_reservations_client_id_fkey] FOREIGN KEY ([client_id]) REFERENCES [dbo].[clients]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[sport_reservations] ADD CONSTRAINT [sport_reservations_company_id_fkey] FOREIGN KEY ([company_id]) REFERENCES [dbo].[companies]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[sport_reservations] ADD CONSTRAINT [sport_reservations_created_by_fkey] FOREIGN KEY ([created_by]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[sport_reservations] ADD CONSTRAINT [sport_reservations_updated_by_fkey] FOREIGN KEY ([updated_by]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[sport_reservations] ADD CONSTRAINT [sport_reservations_deleted_by_fkey] FOREIGN KEY ([deleted_by]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[sport_reservation_items] ADD CONSTRAINT [sport_reservation_items_reservation_id_fkey] FOREIGN KEY ([reservation_id]) REFERENCES [dbo].[sport_reservations]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[sport_reservation_items] ADD CONSTRAINT [sport_reservation_items_product_id_fkey] FOREIGN KEY ([product_id]) REFERENCES [dbo].[products]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[barber_appointments] ADD CONSTRAINT [barber_appointments_stay_id_fkey] FOREIGN KEY ([stay_id]) REFERENCES [dbo].[stays]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[barber_appointments] ADD CONSTRAINT [barber_appointments_client_id_fkey] FOREIGN KEY ([client_id]) REFERENCES [dbo].[clients]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[barber_appointments] ADD CONSTRAINT [barber_appointments_company_id_fkey] FOREIGN KEY ([company_id]) REFERENCES [dbo].[companies]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[barber_appointments] ADD CONSTRAINT [barber_appointments_created_by_fkey] FOREIGN KEY ([created_by]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[barber_appointments] ADD CONSTRAINT [barber_appointments_updated_by_fkey] FOREIGN KEY ([updated_by]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[barber_appointments] ADD CONSTRAINT [barber_appointments_deleted_by_fkey] FOREIGN KEY ([deleted_by]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[barber_appointment_items] ADD CONSTRAINT [barber_appointment_items_appointment_id_fkey] FOREIGN KEY ([appointment_id]) REFERENCES [dbo].[barber_appointments]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[barber_appointment_items] ADD CONSTRAINT [barber_appointment_items_product_id_fkey] FOREIGN KEY ([product_id]) REFERENCES [dbo].[products]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[payments] ADD CONSTRAINT [payments_restaurant_order_id_fkey] FOREIGN KEY ([restaurant_order_id]) REFERENCES [dbo].[restaurant_orders]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[payments] ADD CONSTRAINT [payments_supermarket_order_id_fkey] FOREIGN KEY ([supermarket_order_id]) REFERENCES [dbo].[supermarket_orders]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[payments] ADD CONSTRAINT [payments_laundry_order_id_fkey] FOREIGN KEY ([laundry_order_id]) REFERENCES [dbo].[laundry_orders]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[payments] ADD CONSTRAINT [payments_sport_reservation_id_fkey] FOREIGN KEY ([sport_reservation_id]) REFERENCES [dbo].[sport_reservations]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[payments] ADD CONSTRAINT [payments_barber_appointment_id_fkey] FOREIGN KEY ([barber_appointment_id]) REFERENCES [dbo].[barber_appointments]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[payments] ADD CONSTRAINT [payments_company_id_fkey] FOREIGN KEY ([company_id]) REFERENCES [dbo].[companies]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[payments] ADD CONSTRAINT [payments_created_by_fkey] FOREIGN KEY ([created_by]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[payments] ADD CONSTRAINT [payments_updated_by_fkey] FOREIGN KEY ([updated_by]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[payments] ADD CONSTRAINT [payments_deleted_by_fkey] FOREIGN KEY ([deleted_by]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[account_transactions] ADD CONSTRAINT [account_transactions_client_id_fkey] FOREIGN KEY ([client_id]) REFERENCES [dbo].[clients]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[account_transactions] ADD CONSTRAINT [account_transactions_company_id_fkey] FOREIGN KEY ([company_id]) REFERENCES [dbo].[companies]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[account_transactions] ADD CONSTRAINT [account_transactions_created_by_fkey] FOREIGN KEY ([created_by]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[account_transactions] ADD CONSTRAINT [account_transactions_updated_by_fkey] FOREIGN KEY ([updated_by]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[account_transactions] ADD CONSTRAINT [account_transactions_deleted_by_fkey] FOREIGN KEY ([deleted_by]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[sponsor_accounts] ADD CONSTRAINT [sponsor_accounts_service_company_id_fkey] FOREIGN KEY ([service_company_id]) REFERENCES [dbo].[companies]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[sponsor_accounts] ADD CONSTRAINT [sponsor_accounts_created_by_fkey] FOREIGN KEY ([created_by]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[sponsor_accounts] ADD CONSTRAINT [sponsor_accounts_updated_by_fkey] FOREIGN KEY ([updated_by]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[sponsor_accounts] ADD CONSTRAINT [sponsor_accounts_deleted_by_fkey] FOREIGN KEY ([deleted_by]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[invoices] ADD CONSTRAINT [invoices_client_id_fkey] FOREIGN KEY ([client_id]) REFERENCES [dbo].[clients]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[invoices] ADD CONSTRAINT [invoices_company_id_fkey] FOREIGN KEY ([company_id]) REFERENCES [dbo].[companies]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[invoices] ADD CONSTRAINT [invoices_created_by_fkey] FOREIGN KEY ([created_by]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[invoices] ADD CONSTRAINT [invoices_updated_by_fkey] FOREIGN KEY ([updated_by]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[invoices] ADD CONSTRAINT [invoices_deleted_by_fkey] FOREIGN KEY ([deleted_by]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[licenses] ADD CONSTRAINT [licenses_company_id_fkey] FOREIGN KEY ([company_id]) REFERENCES [dbo].[companies]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[audit_logs] ADD CONSTRAINT [audit_logs_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[audit_logs] ADD CONSTRAINT [audit_logs_company_id_fkey] FOREIGN KEY ([company_id]) REFERENCES [dbo].[companies]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
