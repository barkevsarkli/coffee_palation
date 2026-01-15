import { CUP_SIZE, BEAN_SIZE, COLLISION_REDUCTION } from './constants';

/**
 * Rectangle-to-Rectangle collision detection
 * Used for Coffee Cup vs Pipes
 */
export const checkRectCollision = (rect1, rect2) => {
  const r1 = {
    x: rect1.x + (CUP_SIZE * (1 - COLLISION_REDUCTION)) / 2,
    y: rect1.y + (CUP_SIZE * (1 - COLLISION_REDUCTION)) / 2,
    width: rect1.width * COLLISION_REDUCTION,
    height: rect1.height * COLLISION_REDUCTION,
  };

  return (
    r1.x < rect2.x + rect2.width &&
    r1.x + r1.width > rect2.x &&
    r1.y < rect2.y + rect2.height &&
    r1.y + r1.height > rect2.y
  );
};

/**
 * Circle-to-Rectangle collision detection
 * Used for Coffee Cup center vs Coffee Bean
 */
export const checkCircleRectCollision = (circle, rect) => {
  // Find the closest point on the rectangle to the circle
  const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
  const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));

  // Calculate the distance between the circle's center and this closest point
  const distanceX = circle.x - closestX;
  const distanceY = circle.y - closestY;

  // If the distance is less than the circle's radius, there's a collision
  const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
  return distanceSquared < (circle.radius * circle.radius);
};

/**
 * Check if coffee cup collides with a pipe
 */
export const checkPipeCollision = (cupX, cupY, pipe) => {
  const cup = {
    x: cupX,
    y: cupY,
    width: CUP_SIZE,
    height: CUP_SIZE,
  };

  // Check collision with top pipe
  const topPipe = {
    x: pipe.x,
    y: 0,
    width: pipe.width,
    height: pipe.topHeight,
  };

  // Check collision with bottom pipe
  const bottomPipe = {
    x: pipe.x,
    y: pipe.topHeight + pipe.gapSize,
    width: pipe.width,
    height: pipe.bottomHeight,
  };

  return checkRectCollision(cup, topPipe) || checkRectCollision(cup, bottomPipe);
};

/**
 * Check if coffee cup collects a bean
 */
export const checkBeanCollection = (cupX, cupY, bean) => {
  const circle = {
    x: cupX + CUP_SIZE / 2,
    y: cupY + CUP_SIZE / 2,
    radius: CUP_SIZE / 2,
  };

  const beanRect = {
    x: bean.x,
    y: bean.y,
    width: BEAN_SIZE,
    height: BEAN_SIZE,
  };

  return checkCircleRectCollision(circle, beanRect);
};

/**
 * Check if coffee cup hits the ground
 */
export const checkGroundCollision = (cupY, screenHeight, groundHeight) => {
  return cupY + CUP_SIZE > screenHeight - groundHeight;
};

/**
 * Check if coffee cup hits the ceiling
 */
export const checkCeilingCollision = (cupY) => {
  return cupY < 0;
};

