# Migration `20200922170917-simple-user`

This migration has been generated by LeChatErrant at 9/22/2020, 7:09:17 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
CREATE TABLE "public"."User" (
"id" text   NOT NULL ,
"createdAt" timestamp(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY ("id")
)
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration ..20200922170917-simple-user
--- datamodel.dml
+++ datamodel.dml
@@ -1,0 +1,13 @@
+generator client {
+  provider = "prisma-client-js"
+}
+
+datasource db {
+  provider = "postgresql"
+  url = "***"
+}
+
+model User {
+  id        String   @default(cuid()) @id
+  createdAt DateTime @default(now())
+}
```

