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

### Create the .env file

Create a file named .env in the project root:

```
SUPABASE_URL=""
SUPABASE_KEY=""
```

### Supabase credentials

1. Log in at (https://supabase.com) and open your project.
2. Go to Project Settings -> API
3. Copy the Project URL -> `SUPABASE_URL`
4. Copy the public key -> `SUPABASE_KEY`

### Set up the Supabase contacts table

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

## Running the Application

### Start the server
```bash
npm start
```

Run `nodemon -e '*'` to let files automatically restarts the server on any change

The server listens on **http://localhost:3000** by default

### Access the app in a browser

1. Home -> http://localhost:3000 
2. Find Bikes (Location) -> http://localhost:3000/locationPage.html
3. About Us -> http://localhost:3000/aboutUsPage.html
4. Contact -> http://localhost:3000/contactPage.html

## Testing - Manual Testing

1. Navigation Bar, including Home, About Us, Find Bikes, Contact and Search Now, navigate to the correct page
2. Footer links navigate correctly
3. Search Location and Start Searching buttons navigate to locationPage.html or Find Bikes page
4. Searching by city name (e.g., `DC` for Washington DC) or 
country name (e.g., `GR` for Germany) filters markers and shows a result list
5. Searching for a non-existent location shows "No networks found" message
6. Clicking a network in the result list navigates to resultPage.html with correct query parameters
7. Submitting the form with all fields filled redirects to confirmationPage.html or Confirmation Page
8. Submitting with any field blank shows a validation error message
9.  After a successful submission, the new entry appears in the Supabase contacts table
10. Station map renders with color-coded markers (green = available, amber = limited, red = empty)


## API for server application


## Known Bugs


## Future Development