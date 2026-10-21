use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::mpsc::{self, Sender};

/// Keeps a dedicated thread alive while display sleep is inhibited.
///
/// `SetThreadExecutionState` is scoped to the calling thread, so the request
/// has to be made (and kept) on a thread that does not exit.
pub struct PowerState {
    sender: Sender<bool>,
    active: AtomicBool,
}

impl PowerState {
    pub fn new() -> Self {
        let (sender, receiver) = mpsc::channel::<bool>();

        std::thread::spawn(move || {
            for enabled in receiver {
                apply(enabled);
            }
            apply(false);
        });

        Self {
            sender,
            active: AtomicBool::new(false),
        }
    }

    pub fn set(&self, enabled: bool) {
        if self.active.swap(enabled, Ordering::SeqCst) != enabled {
            let _ = self.sender.send(enabled);
        }
    }
}

impl Default for PowerState {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(windows)]
fn apply(enabled: bool) {
    use windows_sys::Win32::System::Power::{
        SetThreadExecutionState, ES_CONTINUOUS, ES_DISPLAY_REQUIRED, ES_SYSTEM_REQUIRED,
    };

    let flags = if enabled {
        ES_CONTINUOUS | ES_DISPLAY_REQUIRED | ES_SYSTEM_REQUIRED
    } else {
        ES_CONTINUOUS
    };

    // SAFETY: SetThreadExecutionState has no pointer arguments and accepts the
    // documented ES_* flag combination.
    unsafe {
        SetThreadExecutionState(flags);
    }
}

#[cfg(not(windows))]
fn apply(_enabled: bool) {
    // Sleep inhibition is currently implemented for Windows only. The app is
    // released for Windows, and other platforms simply keep the OS default.
}
