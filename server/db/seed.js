import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import bcrypt from 'bcrypt';
import db from '#db/client.js';

const PASSWORD = 'password123';

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
  { owner: 0, name: 'Orbital Sander',      category: 'power',      condition: 'likeNew',   description: 'Barely used. Comes with a pack of 120 grit.' },
  { owner: 1, name: 'Socket Set',          category: 'hand',       condition: 'good',      description: '40-piece metric and standard, in the case.' },
  { owner: 1, name: 'Torque Wrench',       category: 'automotive', condition: 'good',      description: 'Click-type, 1/2 inch drive. Calibrated last year.' },
  { owner: 2, name: 'Garden Tiller',       category: 'garden',     condition: 'fair',      description: 'Starts on the third pull. Loud but it works.' },
  { owner: 2, name: 'Hedge Trimmer',       category: 'garden',     condition: 'good',      description: 'Electric, 40 foot cord included.' },
  { owner: 3, name: 'Floor Jack',          category: 'automotive', condition: 'wellLoved', description: '2 ton. Holds fine, the wheels squeak.' },
  { owner: 3, name: 'Impact Driver',       category: 'power',      condition: 'good',      description: 'Cordless with two batteries and a charger.' },
  { owner: 4, name: 'Tile Saw',            category: 'power',      condition: 'likeNew',   description: 'Wet saw. Used it for one bathroom.' },
  { owner: 4, name: 'Pipe Wrench',         category: 'hand',       condition: 'wellLoved', description: '18 inch. Older than I am, still bites.' },
  { owner: 5, name: 'Extension Ladder',    category: 'ladder',     condition: 'good',      description: '24 foot aluminum. Heavy, bring a friend.' },
  { owner: 5, name: 'Step Ladder',         category: 'ladder',     condition: 'likeNew',   description: '6 foot fiberglass.' },
  { owner: 6, name: 'Pressure Washer',     category: 'outdoor',    condition: 'good',      description: 'Electric, 1800 PSI. Two nozzle tips.' },
  { owner: 6, name: 'Leaf Blower',         category: 'outdoor',    condition: 'fair',      description: 'Gas. Needs choke held for the first minute.' },
  { owner: 7, name: 'Stud Finder',         category: 'other',      condition: 'good',      description: 'Takes a 9V, not included.' },
  { owner: 7, name: 'Drill Press',         category: 'power',      condition: 'good',      description: 'Benchtop. Pickup only, it is not light.' },
  { owner: 8, name: 'Camping Stove',       category: 'outdoor',    condition: 'good',      description: 'Two burner propane. Tank not included.' },
  { owner: 8, name: 'Chainsaw',            category: 'outdoor',    condition: 'fair',      description: '16 inch bar. Chain was sharpened in spring.' },
  { owner: 9, name: 'Framing Hammer',      category: 'hand',       condition: 'wellLoved', description: '22 oz milled face. My favorite tool.' },
  { owner: 9, name: 'Level Set',           category: 'hand',       condition: 'good',      description: 'Two foot and four foot, plus a torpedo.' },
];

//creating an empty list and adding 30 items to it. created a loop
//6 borrows currently checked out. tools 0 through 5. 
     // +i is what staggers them so they never share the same timestamp
//4 borrows overdue. tools 6 through 9. picked up 31+ days ago.
//20 borrows returned. tools 

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
//4 overdue: borrowed, due date already passed
    for (let i = 0; i < 4; i++) {
        borrows.push({
            tool: 6+i,
            checked_out_at: daysAgo(25+i),
            due_at: daysAgo(11+i),
            returned_at: null,
        });
    }

    //20 returned
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