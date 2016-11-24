class CreateVisits < ActiveRecord::Migration[5.0]
  def change
    create_table :visits do |t|
      t.integer :place_id
      t.datetime :date_visit
      t.timestamps
    end
  end
end
