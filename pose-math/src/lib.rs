use wasm_bindgen::prelude::*;
use js_sys::{Float32Array, Float64Array, Array};

#[wasm_bindgen]
pub fn smooth_landmarks(prev: &Float32Array, curr: &Float32Array, alpha: f64) -> Float32Array {
    // Both arrays expected length = N * 3 (x,y,z)
    let n = curr.length();
    let mut out = vec![0f32; n as usize];

    // If prev is empty (length 0), return curr copy
    if prev.length() == 0 {
        for i in 0..n {
            out[i as usize] = curr.get_index(i);
        }
        return Float32Array::from(out.as_slice());
    }

    for i in 0..n {
        let p = prev.get_index(i) as f64;
        let c = curr.get_index(i) as f64;
        let v = (alpha * c + (1.0 - alpha) * p) as f32;
        out[i as usize] = v;
    }

    Float32Array::from(out.as_slice())
}

/// Compute angles (degrees) for the following joints:
/// left_knee, right_knee, left_elbow, right_elbow, left_hip, right_hip
///
/// landmarks: Float32Array [x0,y0,z0, x1,y1,z1, ...] with MediaPipe landmark ordering
#[wasm_bindgen]
pub fn compute_angles(landmarks: &Float32Array) -> Float64Array {
    // helper to index into landmarks
    let get = |idx: usize, comp: usize| -> f64 {
        let pos = (idx * 3 + comp) as u32;
        landmarks.get_index(pos) as f64
    };

    // Vector helpers
    let vec_sub = |a_idx: usize, b_idx: usize| -> (f64, f64, f64) {
        ( get(a_idx,0) - get(b_idx,0),
          get(a_idx,1) - get(b_idx,1),
          get(a_idx,2) - get(b_idx,2) )
    };
    let dot = |ax: f64, ay: f64, az: f64, bx: f64, by: f64, bz: f64| -> f64 {
        ax*bx + ay*by + az*bz
    };
    let norm = |ax: f64, ay: f64, az: f64| -> f64 {
        (ax*ax + ay*ay + az*az).sqrt()
    };
    let angle_between = |a_idx: usize, b_idx: usize, c_idx: usize| -> f64 {
        // angle at b between points a-b-c (i.e., vectors BA and BC)
        let (ax,ay,az) = vec_sub(a_idx, b_idx);
        let (cx,cy,cz) = vec_sub(c_idx, b_idx);
        let d = dot(ax,ay,az, cx,cy,cz);
        let na = norm(ax,ay,az);
        let nc = norm(cx,cy,cz);
        if na == 0.0 || nc == 0.0 { return 0.0; }
        let cos_theta = (d / (na * nc)).clamp(-1.0, 1.0);
        cos_theta.acos().to_degrees()
    };

    // MediaPipe landmarks of interest (indices)
    let left_shoulder = 11usize;
    let right_shoulder = 12usize;
    let left_elbow = 13usize;
    let right_elbow = 14usize;
    let left_wrist = 15usize;
    let right_wrist = 16usize;
    let left_hip = 23usize;
    let right_hip = 24usize;
    let left_knee = 25usize;
    let right_knee = 26usize;
    let left_ankle = 27usize;
    let right_ankle = 28usize;

    // compute angles
    let left_knee_angle = angle_between(left_hip, left_knee, left_ankle);
    let right_knee_angle = angle_between(right_hip, right_knee, right_ankle);

    let left_elbow_angle = angle_between(left_shoulder, left_elbow, left_wrist);
    let right_elbow_angle = angle_between(right_shoulder, right_elbow, right_wrist);

    let left_hip_angle = angle_between(left_shoulder, left_hip, left_knee);
    let right_hip_angle = angle_between(right_shoulder, right_hip, right_knee);

    // Return in a Float64Array [lk, rk, le, re, lh, rh]
    let out = vec![
        left_knee_angle,
        right_knee_angle,
        left_elbow_angle,
        right_elbow_angle,
        left_hip_angle,
        right_hip_angle,
    ];
    Float64Array::from(out.as_slice())
}
