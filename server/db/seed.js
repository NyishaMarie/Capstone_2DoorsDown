import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import db from '#db/client.js';
import {createUser} from '#db/queries/users.js';

// TO DO - createTool comes with P-08 (Priscilla) 
import {createTool} from '#db/queries/tools.js';

// TO DO - createBorrow with N-11 (Nyisha)
import {createBorrow} from '#db/queries/borrows.js';

// until both of those exist, our npm run db:seed won't run properly


const PASSWORD = 'password';

const users = [
  { email: 'sarah@toolshed.dev', full_name: 'Sarah Adams',     neighborhood: 'Riverside',    bio: 'Weekend woodworker. Anything in my garage is fair game.' },
  { email: 'parker@toolshed.dev', full_name: 'Parker Pierce',     neighborhood: 'Riverside',    bio: null },
  { email: 'alison@toolshed.dev', full_name: 'Alison Peterson',     neighborhood: 'Riverside',   bio: 'Gardener. Ask me about the tiller.' },
  { email: 'thomas@toolshed.dev', full_name: 'Thomas Williams', neighborhood: 'Riverside',   bio: 'Fixing up a 96 Tacoma, slowly.' },
  { email: 'adam@toolshed.dev', full_name: 'Adam Johnson', neighborhood: 'Riverside',    bio: null },
  { email: 'nicholas@toolshed.dev', full_name: 'Nicholas Moore', neighborhood: 'Ashbury Heights',    bio: 'Ladders, mostly. I have too many ladders.' },
  { email: 'margaret@toolshed.dev', full_name: 'Margaret Anderson', neighborhood: 'Ashbury Heights',     bio: 'New to the neighborhood, happy to share.' },
  { email: 'rick@toolshed.dev', full_name: 'Rick Smith', neighborhood: 'Ashbury Heights',     bio: null },
  { email: 'jimmy@toolshed.dev', full_name: 'Jimmy Jackson', neighborhood: 'Ashbury Heights',    bio: 'Camping gear and power tools.' },
  { email: 'ray@toolshed.dev', full_name: 'Ray Coleman', neighborhood: 'Ashbury Heights',    bio: 'Retired contractor. Ask before you break it.' },
];

const tools = [
  { owner: 0, name: 'Circular Saw',        category: 'power',      condition: 'good',      description: '7-1/4 inch corded. Blade is sharp, be careful.' },
  { owner: 0, name: 'Orbital Sander',      category: 'power',      condition: 'like_new',   description: 'Barely used. Comes with a pack of 120 grit.' },
  { owner: 1, name: 'Socket Set',          category: 'hand',       condition: 'good',      description: '40-piece metric and standard, in the case.' },
  { owner: 1, name: 'Torque Wrench',       category: 'automotive', condition: 'good',      description: 'Click-type, 1/2 inch drive. Calibrated last year.' },
  { owner: 2, name: 'Garden Tiller',       category: 'garden',     condition: 'fair',      description: 'Starts on the third pull. Loud but it works.' },
  { owner: 2, name: 'Hedge Trimmer',       category: 'garden',     condition: 'good',      description: 'Electric, 40 foot cord included.' },
  { owner: 3, name: 'Floor Jack',          category: 'automotive', condition: 'well_loved', description: '2 ton. Holds fine, the wheels squeak.' },
  { owner: 3, name: 'Impact Driver',       category: 'power',      condition: 'good',      description: 'Cordless with two batteries and a charger.' },
  { owner: 4, name: 'Tile Saw',            category: 'power',      condition: 'like_new',   description: 'Wet saw. Used it for one bathroom.' },
  { owner: 4, name: 'Pipe Wrench',         category: 'hand',       condition: 'well_loved', description: '18 inch. Older than I am, still bites.' },
  { owner: 5, name: 'Extension Ladder',    category: 'ladder',     condition: 'good',      description: '24 foot aluminum. Heavy, bring a friend.' },
  { owner: 5, name: 'Step Ladder',         category: 'ladder',     condition: 'like_new',   description: '6 foot fiberglass.' },
  { owner: 6, name: 'Pressure Washer',     category: 'outdoor',    condition: 'good',      description: 'Electric, 1800 PSI. Two nozzle tips.' },
  { owner: 6, name: 'Leaf Blower',         category: 'outdoor',    condition: 'fair',      description: 'Gas. Needs choke held for the first minute.' },
  { owner: 7, name: 'Stud Finder',         category: 'other',      condition: 'good',      description: 'Takes a 9V, not included.' },
  { owner: 7, name: 'Drill Press',         category: 'power',      condition: 'good',      description: 'Benchtop. Pickup only, it is not light.' },
  { owner: 8, name: 'Camping Stove',       category: 'outdoor',    condition: 'good',      description: 'Two burner propane. Tank not included.' },
  { owner: 8, name: 'Chainsaw',            category: 'outdoor',    condition: 'fair',      description: '16 inch bar. Chain was sharpened in spring.' },
  { owner: 9, name: 'Framing Hammer',      category: 'hand',       condition: 'well_loved', description: '22 oz milled face. My favorite tool.' },
  { owner: 9, name: 'Level Set',           category: 'hand',       condition: 'good',      description: 'Two foot and four foot, plus a torpedo.' },
];

//needed to look this up in order to get the date math correct.

const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (n) => new Date(Date.now() - n * DAY);
const daysAhead = (n) => new Date(Date.now() + n * DAY);

//creating an empty list and adding 30 items to it. created a loop

//6 borrows currently checked out. tools 0 through 5. 
     // +i is what staggers them so they never share the same timestamp 

function buildBorrows() {
    const borrows = [];

//6 active: borrowed, not yet due. tools 0-5 are borrowed, due dates in the future. they havent returned.

    for (let i = 0; i < 6; i++) {
        borrows.push({
            tool: i,
            checked_out_at: daysAgo(3+i),
            due_at: daysAhead(4+i),
            returned_at: null,
        });
    }

//4 borrows overdue. due date already passed. 
// tools 6 through 9. picked up 31+ days ago.

    for (let i = 0; i < 4; i++) {
        borrows.push({
            tool: 6+i,
            checked_out_at: daysAgo(25+i),
            due_at: daysAgo(11+i),
            returned_at: null,
        });
    }

//20 borrows returned. 

    for (let i = 0; i < 20; i++) {
        const out = daysAgo(140-i*5);
        borrows.push({
            tool: i,
            checked_out_at: out,
            due_at: new Date(out.getTime() + 14 * DAY),
            returned_at: new Date(out.getTime() + (3+(i%10)) * DAY),
        });
    }
    return borrows;
}

await seed();
await db.end();
console.log("Database seeded.");

async function seed() {
    const schema = await readFile('./db/schema.sql', 'utf-8');
    await db.query(schema);

    const createdUsers = [];
    for (const user of users) {
        createdUsers.push(await createUser({...user, password:PASSWORD}));
    }

    const createdTools = [];
    for (const tool of tools) {
        createdTools.push(
            await createTool({...tool, owner_id: createdUsers[tool.owner].id})
    );
}

const borrows = buildBorrows();
    for (let i=0; i<borrows.length; i++) {
        const borrow = borrows[i];
        const ownerIndex = tools[borrow.tool].owner;

// offset is always 1-9, never a multiple of 10. borrower is never the owner

        const borrowerIndex = (ownerIndex + 1 + (i%9)) % users.length; 

        await createBorrow({
            tool_id: createdTools[borrow.tool].id,
            borrower_id: createdUsers[borrowerIndex].id,
            checked_out_at: borrow.checked_out_at,
            due_at: borrow.due_at,
            returned_at: borrow.returned_at,
        });
    }
}
