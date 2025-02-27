const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSearchSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  recentSearches: { type: [String], default: [] }
});

userSearchSchema.methods.addSearchTerm = function (searchTerm) {
    // Remove the search term if it already exists to avoid duplicates
    this.recentSearches = this.recentSearches.filter(term => term !== searchTerm);
    // Add the new search term to the beginning of the array
    this.recentSearches.unshift(searchTerm);
    // Ensure the array doesn't exceed six items
    if (this.recentSearches.length > 6) {
      this.recentSearches.pop();
    }
    // Save the updated document
    return this.save();
  };

  const UserSearch = mongoose.model('UserSearch', userSearchSchema);

  module.exports = UserSearch
  