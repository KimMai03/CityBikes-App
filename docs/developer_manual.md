# Developer Manual — CityBikes App

## Installation

### Clone the repository

```bash
git clone https://github.com/KimMai03/CityBikes-App.git
```

### Install dependencies

```bash
npm install
```

This installs all packages listed in `package.json`, including:
1. `express`
2. `body-parser` 
3. `@supabase/supabase-js` 
4. `dotenv` 
5. `nodemon` 
6. `usa-state-validator`

### Create the `.env` file

Create a file named `.env` in the project root:

```
SUPABASE_URL=""
SUPABASE_KEY=""
```

### Supabase credentials

1. Log in at (https://supabase.com) and open your project.
2. Go to Project Settings → API
3. Copy the Project URL → `SUPABASE_URL`
4. Copy the public key → `SUPABASE_KEY`

### Set up the Supabase `contacts` table

The contact form endpoint writes to a table called `contacts`. Run the following SQL in the Supabase SQL editor to create it:

```sql
create table contacts (
  id           bigint generated always as identity primary key,
  first_name   text not null,
  last_name    text not null,
  email        text not null,
  subject      text not null,
  message      text not null,
  created_at   timestamptz default now()
);
```