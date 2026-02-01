<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rubro extends Model
{
    public $timestamps = false;

    protected $table = 'rubros';
    protected $primaryKey = 'id';
    
    protected $fillable = ['nombre'];
    
    public function leads()
    {
        return $this->hasMany(Lead::class, 'rubro_id');
    }
}
