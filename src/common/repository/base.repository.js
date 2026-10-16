export const findById = async ({
  id,
  options,
  select,
  model
}) => {
  const doc = model.findById(id).select(select || "");
  if (options?.populate) {
    doc.populate(options.populate);
  }
  if (options?.lean) {
    doc.lean(options.lean);
  }
  return await doc.exec();
}
export const findOne = async ({
  filter,
  options,
  select,
  model
} = {}) => {
  const doc = model.findOne(filter).select(select || "");
  if (options?.populate) {
    doc.populate(options.populate);
  }
  if (options?.lean) {
    doc.lean(options.lean);
  }
  return await doc.exec();
}
export const find = async ({
  filter,
  options,
  select,
  model
} = {}) => {
  const doc = model.find(filter || {}).select(select || "");
  if (options?.populate) {
    doc.populate(options.populate);
  }
  if (options?.skip) {
    doc.skip(options.skip);
  }

    if (options?.sort) {
    doc.sort(options.sort);
  }

  if (options?.limit) {
    doc.limit(options.limit);
  }

  if (options?.lean) {
    doc.lean(options.lean);
  }
  return await doc.exec();
}
export const countDocuments = async ({
  filter,
  model
} = {}) => {
 return await model.countDocuments(filter || {});
  
}
export const paginate = async ({
  filter = {},
  options = {},

  page = 1,
  
  limit=5,
  model

} = {}) => {
  const  skip = (page - 1) * limit;

const   count = await countDocuments({filter,model});
   const pages = Math.ceil(count / limit);
  
  const docs = await find({
     model,
      filter
  ,
 options:{
  ...options,
  skip,
  limit
 }});
  return {count,limit,pages,currentPage: page ,docs};
}
export const create = async ({
  data,
  options,
  model

}) => {
  return await model.create(data, options) || [];
}
export const insertMany = async ({
  data,
  model

}) => {
  return (await model.insertMany(data))
}
export const updateOne = async ({
  filter,
  update,
  options,
  model

} = {}) => {
  if (Array.isArray(update)) {
    update.push({
      $set: {
        __v: { $add: ["$__v", 1] },
      },
    });
    return await model.updateOne(filter || {}, update, { ...options, runValidators: true, updatePipeline: true });
  }

  return await model.updateOne(
    filter || {},
    { ...update, $inc: { __v: 1 } },
    options
  );
}
export const findOneAndUpdate = async ({
  filter,
  update,
  options,
  model

} = {}) => {
  if (Array.isArray(update)) {
    update.push({
      $set: {
        __v: { $add: ["$__v", 1] },
      },
    });
    return await model.findOneAndUpdate(filter || {}, update, {
      new: true,
      runValidators: true,

      ...options,
      updatePipeline: true,
    }
    );
  }
  return await model.findOneAndUpdate(
    filter || {},
    { ...update, $inc: { __v: 1 } },
    {
      new: true,
      runValidators: true,

      ...options,
    }
  );
}
export const findByIdAndUpdate = async ({
  id,
  update,
  options = { new: true },
  model

}) => {
  return await model.findByIdAndUpdate(
    id,
    { ...update, $inc: { __v: 1 } },
    options
  );
}
export const deleteOne = async ({
  filter,
  model

}) => {
  return await model.deleteOne(filter || {});
}
export const deleteMany = async ({
  filter,
  model

}) => {
  return await model.deleteMany(filter || {});
}
export const findOneAndDelete = async ({
  filter,
  model

} = {}) => {
  return await model.findOneAndDelete(
    filter || {},
  );
}
export const createOne = async ({
  data,
  options,
  model
}) => {
  const doc = await model.create(data, options);
  return doc
}