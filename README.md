# Food Survey

This project was created because the cafeteria at my school (which serves fresh and delicious menus including salads, desserts and fruits everyday) wanted to shift to a less meat-based diet. They wanted to gauge the students' reactions to the new menus and I offered to build an app for it.

### Q: What challenges did I have to overcome, what was interesting about this project?

A: The app has to be fast and interactive to maximise student participation and retention rates. I implemented a results page at the end of the survey, so students would be able to see what others thought.

To inform users I also added a message popup at the beginning of the survey that can be dismissed.

I also had to make sure the more technically versed students would have a hard time voting twice. I store if they have already voted in LocalStorage and send the information along with the request. If they have already voted, their vote is silently discarded. CSRF was off the table sadly, as backend and frontend are not on the same server.

## Architecture
The app relies on two frontend containers, one backend, a python script and a Firestore/Postgres database. Using environment variables you can switch between the database. This was necessary to keep down costs on GCP, by using Firestore.

### Backend
The backend is responsible for interacting with the database and the python script. It gets json api requests for votes, results and stats. I used NodeJS and Express to build it.

### Frontend
The main frontend is responsible for the voting process. The end-user sees only this page. They vote, select their class and then get to see their results.

### Frontend-Admin
This is where the kitchen staff enter today's menu, see the results and can view the global ranking.

### Script
This script is run after the vote is finished and calculates the different statistics availiable to rank the menus. It also turns of voting for the users.
It is triggered either manually, using the button on the admin panel, or by a `Cloud Scheduler` on GCP, at 13:30 every day.

## Usage

### End-User
The screen the users see when voting has not yet begun:

<img src="./.github/images/not_open.png" alt="Voting not open" width="200"/>

The message:

<img src="./.github/images/message.png" alt="The message" width="200"/>

The menu choice:

<img src="./.github/images/menu.png" alt="Choose which menu you ate" width="200"/>

The user is prompted to score the menu:

<img src="./.github/images/score.png" alt="Select score for menu" width="200"/>

The user is asked for their class:

<img src="./.github/images/class.png" alt="Asking for class" width="200"/>

The user can now see their results and compare them:

<img src="./.github/images/results_class.png" alt="User sees results" width="200"/>

### Staff
Enter today's menu (You can add multiple menus and use the arrows on top to add menus for the next days):

<img src="./.github/images/menu_add.png" alt="Admin enter menu" width="200"/>

See current results:

<img src="./.github/images/results_day.png" alt="See current results" width="200"/>

Change message:

<img src="./.github/images/message_admin.png" alt="Change message" width="200"/>

Menus are then ranked:

<img src="./.github/images/admin_stats.png" alt="See rankings" width="400"/>

Select different ranking strategies:

<img src="./.github/images/admin_strats.png" alt="Select ranking strategy" width="400"/>

## GCP
I deployed the app on GCP:
 - the containers are all running on `Cloud Run`
 - I manage secrets and environment variables using the `Secret Manager`
 - The Database is a simple `Firestore` database running in `Native Mode`