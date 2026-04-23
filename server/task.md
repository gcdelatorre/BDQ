so im kind of new to this setup specially with mysql. and i came back from coding last 2 months ago. im kinda having a hard time ive said like 2 days ago. because typically on my previous projects i use MERN stack right and i had sucessfully built 2 big project.

im having a hard time with the patterns on what will i do first. for example in my previous mern project, i do this
export const registerUser = async (payload) => {
    const { email, password, name } = payload;

    const user = await User.findOne({ email });
    if (user) {
        throw { status: 400, message: 'User already exists' };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
        email,
        passwordHash: hashedPassword,
        name
    });

    return newUser;
}

so in mysql its different, pls provide examples so i can follow a pattern. is it normal right? i came back from coding 2 months ago, will i be able to catch up again like at some point i dont even know what to type i forgot some basic knowledge but i have the logic in me