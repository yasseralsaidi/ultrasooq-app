import Swal from "sweetalert2";
// import withReactContent from "sweetalert2-react-content";

// Initialize SweetAlert with React content support
// const SweetAlert = withReactContent(Swal);

type ConfirmDialogProps = {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
};

// Common confirmation dialog component
const ConfirmDialog = async ({
  title = "Delete Brand",
  message = "Are you sure you want to delete Samsung?",
  confirmText = "Confirm",
  cancelText = "Cancel",

}: ConfirmDialogProps): Promise<boolean> => {
  const result = await Swal.fire({
    title: '', // Set title to an empty string to prevent default styling
    html: `
      <div style="display: flex; flex-direction: column; border-radius: 0.375rem; box-shadow: 0 4px 8px rgba(0,0,0,0.1); overflow: hidden; background-color: white;">
        <div style="display: flex; flex-shrink: 0; align-items: center; padding: 16px; background-color: #f8d7da; border-bottom: 1px solid #dee2e6;">
          <div style="font-size: 1.25rem; font-weight: 500;">Delete Brand</div>
        </div>
        <div style="position: relative; flex: 1 1 auto; padding: 16px;">
          <div role="alert" style="padding: 16px; border-radius: 0.375rem; background-color: #f8d7da; color: #842029;">
            Are you sure you want to delete Apple?
          </div>
        </div>
        <div style="display: flex; flex-shrink: 0; flex-wrap: wrap; align-items: center; justify-content: flex-end; padding: 8px; background-color: #f1f1f1; border-top: 1px solid #dee2e6;">
          <button type="button" id="cancelBtn" style="background-color: #343a40; color: white; border: none; padding: 6px 12px; border-radius: 0.375rem; cursor: pointer; font-size: 0.875rem;">Close</button>
          <button type="button" id="confirmBtn" style="background-color: #d9534f; color: white; border: none; padding: 6px 12px; border-radius: 0.375rem; cursor: pointer; font-size: 0.875rem; margin-left: 8px;">Delete Brand</button>
        </div>
      </div>
    `,
    showCancelButton: false, // Disable default cancel button
    showConfirmButton: false, // Disable default confirm button
    showCloseButton: true, // Show the close button
    customClass: {
      popup: 'custom-swal-popup', // Custom class for further styling if needed
    },
    buttonsStyling: false, // Disable default button styling
    position: 'top', // Position the popup
    willOpen: (popup) => {
      // Remove default styling
      popup.style.border = 'none'; // Remove border
      popup.style.boxShadow = 'none'; // Remove box shadow
      popup.style.background = 'none'; // Remove background
    },
    didOpen: () => {
      const confirmBtn = document.getElementById('confirmBtn');
      const cancelBtn = document.getElementById('cancelBtn');

      if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
          Swal.close(); // Close the popup
          console.log('Confirmed!'); // Do something on confirm
        });
      }

      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
          Swal.close(); // Close the popup
          console.log('Cancelled!'); // Do something on cancel
        });
      }
    },
  });


  return result.isConfirmed; // Returns true if confirmed, false if canceled
};

// Add inline CSS to position the modal at the top-middle with animation
// const style = document.createElement("style");
// style.innerHTML = `
//   .custom-swal-popup {
//     top: 20px !important;       /* Position near the top */
//     margin: 0 auto;             /* Center horizontally */
//     animation: slideInFromTop 0.4s ease-out; /* Apply slide-in animation */
//   }

//   /* Slide-in animation from the top */
//   @keyframes slideInFromTop {
//     0% {
//       transform: translateY(-100%);
//       opacity: 0;
//     }
//     100% {
//       transform: translateY(0);
//       opacity: 1;
//     }
//   }
// `;
// document.head.appendChild(style);

export default ConfirmDialog;
