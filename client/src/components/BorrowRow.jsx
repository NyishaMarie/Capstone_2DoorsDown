// one row for one borrow. used on My Borrows and on My Toolshed

export default function BorrowRow({ borrow, side, children }) {

    // on My Borrows, we want to see who owns it
    // on My Toolshed, we want to see who took it
    // same data either way, we just show the other person
    const otherPerson = side === "lent" ? borrow.borrowerName : borrow.ownerName;
    const label = side === "lent" ? "Borrowed by" : "From";

    // three states. returned wins, then overdue, otherwise it's just out

    let status = "Out";
    if (borrow.returnedAt) status = "Returned";
    else if (borrow.isOverdue) status = "Overdue";

    return (
        <li className="borrow-row">
            <h3>{borrow.toolName}</h3>
            <p>{label} {otherPerson}</p>
            <p>Due {new Date(borrow.dueAt).toLocaleDateString()}</p>

            {/* same shape as the category tags on Browse */}
            <span className={`tag borrow-row__status borrow-row__status--${status.toLowerCase()}`}>
                {status}
            </span>

            {/* children is the empty slot. whoever uses this row decides what goes in it */}
            {children}
        </li>
    );
}
