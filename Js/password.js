const digits = '0123456789';
  const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowerCase = 'abcdefghijklmnopqrstuvwxyz';

  // Function to randomly pick a character from a string
  const randomChar = (str) => str.charAt(Math.floor(Math.random() * str.length));

  // Function to generate the required string
  const generatePart = (length, requiredChars) => {
    let part = [];
    
    // Ensure we have one of each required character
    part.push(randomChar(requiredChars.digits));
    part.push(randomChar(requiredChars.upperCase));
    part.push(randomChar(requiredChars.lowerCase));
    
    // Add one random character from all available characters if necessary
    const allChars = requiredChars.digits + requiredChars.upperCase + requiredChars.lowerCase;
    if (length > 3) part.push(randomChar(allChars)); // For b, we add an extra character

    // Shuffle the array to ensure the order is random
    part.sort(() => Math.random() - 0.5);

    return part.join('');
  };

  // Define the required characters for a, b, and c
  const requiredChars = {
    digits: digits,
    upperCase: upperCase,
    lowerCase: lowerCase
  };

  // Generate the 3 parts with the required characters
  const a = generatePart(3, requiredChars); // 3 characters for 'a'
  const b = generatePart(4, requiredChars); // 4 characters for 'b'
  const c = generatePart(3, requiredChars); // 3 characters for 'c'

  // Output the final result with '-' separator
  console.log(`${a}-${b}-${c}`);