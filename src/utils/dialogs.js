function showConfirmDialog(actionId) {
  let message;
  switch (actionId) {
    case 1:
      message =
        "Are you sure you want to delete the selected resource/s? This action is irreversible.";
      break;
    case 2:
      message =
        "Are you sure you want to unassign the selected employee's NFC tag? This action will delete all associated attendance entries.";
      break;
    default:
      message = "Are you sure you want to proceed?";
  }
  const userConfirmed = window.confirm(message);
  return userConfirmed;
}

export { showConfirmDialog };
